import { SETTINGS } from '../../modules/SettingsManager';
import { GlobalState } from '../../modules/GlobalState';
import { PageLoader } from '../../modules/PageLoader';
import { DouyuAPI } from '../../utils/DouyuAPI';
import { Utils } from '../../utils/utils';
import { ClaimEventStore } from '../stats/ClaimEventStore.js';
import {
    SNATCH_OUTCOME,
    classifySnatchResponse,
    countConsecutiveImmediate12001,
    createRedBagBinding,
    getRedBagKey,
    getSnatchAttemptOffsets,
    selectActiveRedBag,
    summarizePrizePool,
    toDisplayPrizes,
} from './RedBagState.js';

const MAX_DISCOVERY_ATTEMPTS = 6;
const MAX_CONSECUTIVE_FAILURES = 3;
const ACCOUNT_RISK_THRESHOLD = 3;
const tasks = new Map();
const roomTaskIds = new Map();
const activeBagKeys = new Set();
const completedBagKeys = new Set();
let taskSequence = 0;

const cancelAllTasks = () => {
    for (const task of tasks.values()) {
        task.cancelled = true;
        task.prewarm?.close();
    }
    tasks.clear();
    roomTaskIds.clear();
    activeBagKeys.clear();
    const state = GlobalState.get();
    state.tasks = {};
    GlobalState.set(state);
};

const randomDelay = (min, max) => Utils.getRandomDelay(
    Math.max(0, Number(min) || 0),
    Math.max(Number(min) || 0, Number(max) || 0),
);

const waitForTask = async (task, durationMs) => {
    const deadline = Date.now() + Math.max(0, durationMs);
    while (!task.cancelled && Date.now() < deadline) {
        await Utils.sleep(Math.min(250, deadline - Date.now()));
    }
    return !task.cancelled;
};

const getNextBeijingDayDelay = () => {
    const now = Date.now();
    const beijingNow = new Date(now + 8 * 60 * 60 * 1000);
    const resetAt = Date.UTC(
        beijingNow.getUTCFullYear(),
        beijingNow.getUTCMonth(),
        beijingNow.getUTCDate() + 1,
        0,
        0,
        30,
    ) - 8 * 60 * 60 * 1000;
    return Math.max(0, resetAt - now);
};

const recordTerminal = (binding, result, details = {}) => ClaimEventStore.record({
    roomId: binding.bag.rid,
    roomName: binding.roomName,
    bagId: binding.bag.id,
    bagKey: binding.key,
    phase: 'claim',
    result,
    source: 'snatch',
    ...details,
});

const releaseCandidate = (task, binding, { removeState = true } = {}) => {
    activeBagKeys.delete(binding.key);
    completedBagKeys.add(binding.key);
    if (task.currentRoomId) {
        roomTaskIds.delete(task.currentRoomId);
        if (removeState) GlobalState.removeTask(task.currentRoomId);
    }
    task.currentRoomId = null;
    task.prewarm = null;
};

const discoverCandidate = async (task) => {
    for (let attempt = 0; attempt < MAX_DISCOVERY_ATTEMPTS && !task.cancelled; attempt += 1) {
        const currentRid = task.currentRoomId || SETTINGS.CONTROL_ROOM_ID;
        const url = await DouyuAPI.getRoom(SETTINGS.API_ROOM_FETCH_COUNT, currentRid, 0);
        if (!url) return null;

        const roomId = url.match(/\/(\d+)/)?.[1];
        if (!roomId || roomTaskIds.has(roomId)) continue;

        try {
            const roomData = await DouyuAPI.getRoomRedBags(roomId);
            const bag = selectActiveRedBag({
                redBagList: roomData.redBagList,
                roomId,
                completedKeys: completedBagKeys,
            });
            if (!bag) continue;

            const bagKey = getRedBagKey(bag, roomId);
            if (activeBagKeys.has(bagKey)) continue;
            return { url, roomId, roomData, bag };
        } catch (error) {
            Utils.claimLog('SNATCH', '候选红包确认失败', {
                roomId,
                reason: String(error?.message || error),
            });
        }
    }
    return null;
};

const refreshTerminalRoomState = async (binding) => {
    try {
        const roomData = await DouyuAPI.getRoomRedBags(binding.bag.rid);
        const sameBag = roomData.redBagList.find((bag) =>
            getRedBagKey(bag, binding.bag.rid) === binding.key
        );
        return sameBag ? Number(sameBag.status) : null;
    } catch {
        return null;
    }
};

const claimBoundBag = async (task, binding, openedAt) => {
    const attemptOffsets = getSnatchAttemptOffsets(binding.bag.waitSec);
    let consecutiveFailures = 0;
    let attemptCount = 0;
    let notReadyCount = 0;
    let lastAttemptAt = 0;

    Utils.claimLog('SNATCH', '短时开页完成，等待首次领取', {
        roomId: binding.bag.rid,
        bagId: binding.bag.id,
        intervalMs: attemptOffsets[0],
    });

    for (const offsetMs of attemptOffsets) {
        if (task.cancelled) return { stop: true };
        const nextAttemptAt = Math.max(openedAt + offsetMs, lastAttemptAt + 10_000);
        GlobalState.updateTask(binding.bag.rid, 'WAITING', '倒计时', {
            countdown: { endTime: nextAttemptAt },
            prizes: toDisplayPrizes(binding.bag.prizeList),
            claimSource: 'snatch',
            bagId: binding.bag.id,
        });
        if (!await waitForTask(task, nextAttemptAt - Date.now())) return { stop: true };

        const requestedAt = Date.now();
        lastAttemptAt = requestedAt;
        GlobalState.updateTask(binding.bag.rid, 'CLAIMING', '请求可领取状态', {
            countdown: null,
            prizes: toDisplayPrizes(binding.bag.prizeList),
            claimSource: 'snatch',
            bagId: binding.bag.id,
        });

        try {
            attemptCount += 1;
            const response = await DouyuAPI.snatchRedBag(binding.bag);
            const outcome = classifySnatchResponse(response);
            consecutiveFailures = outcome === SNATCH_OUTCOME.UNKNOWN
                ? consecutiveFailures + 1
                : 0;

            Utils.claimLog('SNATCH', '控制页领取响应', {
                roomId: binding.bag.rid,
                bagId: binding.bag.id,
                result: outcome,
                error: response?.error,
                msg: response?.msg,
                durationMs: requestedAt - openedAt,
            });

            if (outcome === SNATCH_OUTCOME.SUCCESS) {
                const prizes = toDisplayPrizes(response?.data?.prizeList);
                const rewards = summarizePrizePool(response?.data?.prizeList);
                const rewardText = [
                    rewards.coins > 0 ? `金币 ${rewards.coins}` : '',
                    rewards.starlight > 0 ? `星光棒 ${rewards.starlight}` : '',
                ].filter(Boolean).join('、') || '未获得奖励';
                recordTerminal(binding, 'success', {
                    durationMs: Date.now() - openedAt,
                    rewardText,
                    rewards,
                });
                Utils.claimLog('SNATCH', '领取结果已确认', {
                    roomId: binding.bag.rid,
                    bagId: binding.bag.id,
                    rewardText,
                });
                GlobalState.updateTask(binding.bag.rid, 'SUCCESS', '领取成功', {
                    countdown: null,
                    prizes,
                    claimSource: 'snatch',
                    bagId: binding.bag.id,
                });
                await waitForTask(task, 1_500);
                return { result: 'success' };
            }

            if (outcome === SNATCH_OUTCOME.EXHAUSTED) {
                const details = {
                    error: response?.error,
                    reason: String(response?.msg || '红包已派完'),
                    attemptCount,
                    notReadyCount,
                };
                const riskCount = Number(response?.error) === 12001 && attemptCount === 1
                    ? countConsecutiveImmediate12001([{
                        timestamp: Date.now(),
                        phase: 'claim',
                        result: 'exhausted',
                        bagKey: binding.key,
                        ...details,
                    }, ...ClaimEventStore.list({ days: 1 })])
                    : 0;

                if (riskCount >= ACCOUNT_RISK_THRESHOLD) {
                    recordTerminal(binding, 'risk_suspected', details);
                    GlobalState.setAccountRisk(true, {
                        count: riskCount,
                        expiresAt: Date.now() + getNextBeijingDayDelay(),
                    });
                    Utils.claimLog('SNATCH', '连续首次请求返回 12001，疑似账户风控，仅提示不停止领取', {
                        count: riskCount,
                    });
                    return { result: 'risk_suspected' };
                }

                recordTerminal(binding, outcome, details);
                return { result: outcome };
            }

            if (outcome === SNATCH_OUTCOME.ALREADY_CLAIMED) {
                recordTerminal(binding, outcome, {
                    error: response?.error,
                    reason: String(response?.msg || '已经领取'),
                    attemptCount,
                    notReadyCount,
                });
                return { result: outcome };
            }

            if (outcome === SNATCH_OUTCOME.DAILY_LIMIT) {
                recordTerminal(binding, 'daily_limit');
                GlobalState.setDailyLimit(true);
                return { result: 'daily_limit', dailyLimit: true };
            }

            if (outcome === SNATCH_OUTCOME.AUTH_FAILED) {
                recordTerminal(binding, 'auth_failed');
                GlobalState.updateTask(binding.bag.rid, 'ERROR', '领取鉴权失败', {
                    countdown: null,
                    claimSource: 'snatch',
                });
                return { result: 'auth_failed', stop: true, preserveState: true };
            }

            if (outcome === SNATCH_OUTCOME.UNKNOWN &&
                consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
                recordTerminal(binding, 'unknown', { reason: String(response?.msg || '未知业务响应') });
                return { result: 'unknown' };
            }

            if (outcome === SNATCH_OUTCOME.NOT_READY) notReadyCount += 1;
        } catch (error) {
            consecutiveFailures += 1;
            Utils.claimLog('SNATCH', '控制页领取请求失败', {
                roomId: binding.bag.rid,
                bagId: binding.bag.id,
                reason: String(error?.message || error),
                httpStatus: error?.httpStatus,
            });
            if (error?.kind === 'auth' || consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
                recordTerminal(binding, 'auth_failed', { reason: String(error?.message || error) });
                GlobalState.updateTask(binding.bag.rid, 'ERROR', '领取请求失败', {
                    countdown: null,
                    claimSource: 'snatch',
                });
                return { result: 'request_failed', stop: true, preserveState: true };
            }
        }
    }

    if (task.cancelled) return { stop: true };
    const finalStatus = await refreshTerminalRoomState(binding);
    const result = finalStatus === 3 ? 'exhausted' : 'unknown';
    recordTerminal(binding, result, {
        reason: finalStatus === 3 ? 'room/list 确认红包结束' : '五次领取尝试后仍未确认结果',
    });
    return { result };
};

const processCandidate = async (task, candidate) => {
    const binding = createRedBagBinding(candidate.bag, candidate.roomData.receivedAt);
    binding.roomName = candidate.roomData.anchorName || `房间 ${candidate.roomId}`;
    task.binding = binding;
    task.currentRoomId = candidate.roomId;
    roomTaskIds.set(candidate.roomId, task.id);
    activeBagKeys.add(binding.key);

    GlobalState.updateTask(candidate.roomId, 'OPENING', '短时初始化', {
        nickname: candidate.roomData.anchorName || `房间 ${candidate.roomId}`,
        countdown: null,
        prizes: toDisplayPrizes(binding.bag.prizeList),
        claimSource: 'snatch',
        bagId: binding.bag.id,
    });

    try {
        task.prewarm = PageLoader.openPrewarmTab(candidate.url);
        const openedAt = task.prewarm.openedAt;
        if (!await waitForTask(task, SETTINGS.ROOM_PREWARM_DURATION)) {
            return { stop: true };
        }
        task.prewarm.close();
        task.prewarm = null;
        return await claimBoundBag(task, binding, openedAt);
    } catch (error) {
        recordTerminal(binding, 'open_failed', { reason: String(error?.message || error) });
        GlobalState.updateTask(candidate.roomId, 'ERROR', '短时开页失败', {
            countdown: null,
            claimSource: 'snatch',
        });
        return { result: 'open_failed' };
    } finally {
        task.prewarm?.close();
        task.prewarm = null;
    }
};

const runTask = async (task, firstCandidate) => {
    let candidate = firstCandidate;
    try {
        while (!task.cancelled && candidate) {
            const outcome = await processCandidate(task, candidate);

            if (outcome.dailyLimit && SETTINGS.DAILY_LIMIT_ACTION === 'CONTINUE_DORMANT') {
                GlobalState.updateTask(candidate.roomId, 'DORMANT', '等待次日恢复', {
                    countdown: null,
                    claimSource: 'snatch',
                });
                if (!await waitForTask(task, getNextBeijingDayDelay())) break;
                GlobalState.setDailyLimit(false);
            }

            releaseCandidate(task, task.binding, { removeState: !outcome.preserveState });
            if (outcome.dailyLimit && SETTINGS.DAILY_LIMIT_ACTION === 'STOP_ALL') {
                cancelAllTasks();
                break;
            }
            if (outcome.stop) break;
            if (!await waitForTask(task, randomDelay(600, 1_400))) break;
            candidate = await discoverCandidate(task);
        }
    } catch (error) {
        Utils.claimLog('SNATCH', '领取任务异常结束', { reason: String(error?.message || error) });
        if (task.currentRoomId) {
            GlobalState.updateTask(task.currentRoomId, 'ERROR', '任务异常结束', {
                countdown: null,
                claimSource: 'snatch',
            });
        }
    } finally {
        task.prewarm?.close();
        tasks.delete(task.id);
        if (task.currentRoomId) roomTaskIds.delete(task.currentRoomId);
    }
};

export const RedBagTaskController = {
    getActiveCount() {
        return tasks.size;
    },

    async start() {
        if (tasks.size >= SETTINGS.MAX_CONCURRENT_TASKS) return false;
        const limitState = GlobalState.getDailyLimit();
        if (limitState?.reached) return false;

        const task = {
            id: `control-task-${Date.now()}-${taskSequence += 1}`,
            cancelled: false,
            currentRoomId: null,
            prewarm: null,
            binding: null,
        };
        tasks.set(task.id, task);

        try {
            const candidate = await discoverCandidate(task);
            if (!candidate || task.cancelled) {
                tasks.delete(task.id);
                return false;
            }
            void runTask(task, candidate);
            return true;
        } catch (error) {
            tasks.delete(task.id);
            Utils.claimLog('SNATCH', '启动领取任务失败', { reason: String(error?.message || error) });
            return false;
        }
    },

    stopRoom(roomId) {
        const normalizedRoomId = String(roomId);
        const taskId = roomTaskIds.get(normalizedRoomId);
        const task = taskId ? tasks.get(taskId) : null;
        if (!task) {
            GlobalState.removeTask(normalizedRoomId);
            return false;
        }
        task.cancelled = true;
        task.prewarm?.close();
        roomTaskIds.delete(normalizedRoomId);
        if (task.binding?.key) activeBagKeys.delete(task.binding.key);
        GlobalState.removeTask(normalizedRoomId);
        return true;
    },

    stopAll() {
        cancelAllTasks();
    },

    dispose() {
        this.stopAll();
    },
};
