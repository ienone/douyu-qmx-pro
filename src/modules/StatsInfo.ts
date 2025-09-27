/**
 * @file StatsInfo.ts
 * @description 负责统计面板的UI和数据更新
 */
import '../styles/ControlPanel-refactored.css';
import { SETTINGS } from './SettingsManager.js';
import { Utils } from '../utils/utils.js';
import { DouyuAPI } from '../utils/DouyuAPI.js';
import { GlobalState } from './GlobalState.js';
import type { RuntimeSettings } from '../types/Config';
import type { GlobalStateData } from '../types/GlobalState';

const typedSettings = SETTINGS as RuntimeSettings;

const globalValue: globalValue = {
    currentDatePage: Utils.formatDateAsBeijing(new Date()), // 当前查看的日期页面
    updateIntervalID: undefined,
    statElements: new Map(),
};

export const StatsInfo = {
    init: async function () {
        // 初始化组件
        let stats: HTMLElement;
        try {
            stats = await Utils.getElementWithRetry('.qmx-stats-content');
        } catch (error) {
            Utils.log(`[数据统计] 初始化失败，错误: ${error}`);
            return;
        }

        const statsConfigs: [string, string][] = [
            ['receivedCount', '已领个数'],
            ['total', '总金币'],
            ['avg', '平均每个'],
        ] as const;
        for (const [name, nickname] of statsConfigs) {
            const element = this.initRender(name, nickname);
            stats.appendChild(element);
            // 定义缓存元素
            try {
                const details: HTMLElement = await Utils.getElementWithRetry('.qmx-stat-details', element);
                if (details) {
                    globalValue.statElements.set(
                        name as keyof DailyStatsData,
                        details as HTMLElement
                    );
                }
            } catch (error) {
                Utils.log(`[数据统计] 缓存元素获取失败: ${error}`);
            }
        }

        // 统一数据初始化和校验
        GM_setValue('douyu_qmx_stats_lock', false);
        this.ensureTodayDataExists();
        this.updateTodayData();

        // 获取最新的金币记录并更新今日数据
        await this.getCoinListUpdate();

        // 去除过期数据
        this.removeExpiredData();

        // 绑定事件
        this.bindEvents();

        // 统一定时器调度
        this.updateInterval();

        // 每日0点更新数据
        setInterval(() => {
            this.updateDataForDailyReset();
        }, 60 * 1000);
    },

    /**
     * 设置数据更新定时器
     */
    updateInterval: function () {
        if (globalValue.updateIntervalID) {
            clearInterval(globalValue.updateIntervalID);
            globalValue.updateIntervalID = undefined;
        }
        globalValue.updateIntervalID = setInterval(() => {
            // 更新数据
            this.checkUpdate();
        }, typedSettings.STATS_UPDATE_INTERVAL);
    },

    /**
     * 统一初始化和校验今日数据
     * @returns {allData: AllStatsData; todayData: DailyStatsData; today: string;} 包含所有数据和今日数据的对象
     */
    ensureTodayDataExists: function (): {
        allData: AllStatsData;
        todayData: DailyStatsData;
        today: string;
    } {
        const today: string = Utils.formatDateAsBeijing(new Date());
        let allData: AllStatsData | null = GM_getValue(typedSettings.STATS_INFO_STORAGE_KEY, null);
        if (!allData || typeof allData !== 'object') {
            allData = {};
        }
        if (!allData[today]) {
            allData[today] = {
                receivedCount: 0,
                avg: 0,
                total: 0,
            };
            GM_setValue(typedSettings.STATS_INFO_STORAGE_KEY, allData);
        }
        return { allData, todayData: allData[today], today };
    },

    /**
     * 绑定所有事件
     */
    bindEvents: function () {
        try {
            this.bindRefreshEvent();
            this.bindSwitcherLeft();
            this.bindSwitcherRight();
        } catch (e) {
            Utils.log(`[数据统计] 绑定事件异常: ${e}`);
            setTimeout(() => {
                this.bindEvents();
            }, 500);
        }
    },

    /**
     * 绑定刷新按钮事件
     */
    bindRefreshEvent: function () {
        const refreshButton: HTMLElement | null = document.querySelector('.qmx-stats-refresh');
        const today: string = Utils.formatDateAsBeijing(new Date());
        if (!refreshButton) {
            throw new Error('无法找到刷新按钮元素');
        }

        if (globalValue.currentDatePage !== today) {
            refreshButton.classList.add('disabled');
            refreshButton.onclick = null;
            return;
        }
        setTimeout(() => {
            refreshButton.classList.remove('disabled');
        }, 300);
        refreshButton.onclick = async (e) => {
            e.stopPropagation();

            // 旋转动画
            void refreshButton.offsetWidth; // 触发重绘以重新应用动画
            refreshButton.classList.add('rotating');
            setTimeout(() => {
                refreshButton.classList.remove('rotating');
            }, 1000);

            await this.getCoinListUpdate();
        };
    },

    /**
     * 通用的绑定切换按钮函数
     * @param {string} direction - 方向，'left' 或 'right'
     */
    bindSwitcher: function (direction: string) {
        const { allData, today } = this.ensureTodayDataExists();
        globalValue.currentDatePage = globalValue.currentDatePage ?? today;
        const dateList: string[] = Object.keys(allData);
        const currentIndex: number = dateList.indexOf(globalValue.currentDatePage);

        const statsLable: HTMLElement | null = document.querySelector('.qmx-stats-label');
        const indecator: HTMLElement | null = document.querySelector('.qmx-stats-indicator');
        const button: HTMLElement | null = document.querySelector(`#qmx-stats-${direction}`);
        if (!statsLable || !indecator || !button) {
            Utils.log('[数据统计] 切换按钮绑定失败，正在重试');
            setTimeout(() => {
                this.bindSwitcher(direction);
            }, 500);
            return;
        }

        // 检查是否需要禁用按钮
        const shouldDisableButton: boolean =
            direction === 'left'
                ? dateList.length <= 1 || currentIndex - 1 < 0
                : dateList.length <= 1 || currentIndex + 1 >= dateList.length;

        if (shouldDisableButton) {
            button.classList.add('disabled');
            button.onclick = null;
            return;
        }

        button.classList.remove('disabled');
        button.onclick = (e) => {
            e.stopPropagation();

            // 计算新索引
            const newIndex: number = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
            // 确保索引有效
            if (newIndex >= 0 && newIndex < dateList.length) {
                globalValue.currentDatePage = dateList[newIndex];
                this.refreshUI(allData[globalValue.currentDatePage]);
                this.bindEvents();
            }
            // 更新标签文本
            this.itemTransiton(indecator);
            if (globalValue.currentDatePage !== today) {
                this.contentTransition(statsLable, globalValue.currentDatePage);
            } else {
                this.contentTransition(statsLable, '今日统计');
            }
            // 刷新更新数据计时器
            if (globalValue.currentDatePage === today) {
                this.updateInterval();
                // 执行一次更新，防止切换后数据不及时
                this.getCoinListUpdate();
            } else {
                // 停止更新
                clearInterval(globalValue.updateIntervalID);
                globalValue.updateIntervalID = undefined;
            }
        };
    },

    /**
     * 绑定左切换按钮事件
     */
    bindSwitcherLeft: function () {
        this.bindSwitcher('left');
    },

    /**
     * 绑定右切换按钮事件
     */
    bindSwitcherRight: function () {
        this.bindSwitcher('right');
    },

    /**
     * 在修改内容时添加过渡效果
     * @param {HTMLElement} element
     * @param {string} newText
     * @param {number} duration
     */
    contentTransition: function (element: HTMLElement, newText: string, duration: number = 300) {
        element.classList.add('transitioning');
        setTimeout(() => {
            element.textContent = newText;
            element.classList.remove('transitioning');
        }, duration);
    },

    /**
     * 为元素添加过渡效果
     * @param {HTMLElement} element
     * @param {number} duration
     */
    itemTransiton: function (element: HTMLElement, duration: number = 300) {
        element.classList.add('transitioning');
        setTimeout(() => {
            element.classList.remove('transitioning');
        }, duration);
    },

    /**
     * 初始化组件
     * @param {string} name - 小组件名字
     * @param {string} nickname - 小组件中文名
     * @returns {HTMLDivElement}
     */
    initRender: function (name: string, nickname: string): HTMLDivElement {
        const newItem: HTMLDivElement = document.createElement('div');
        newItem.className = 'qmx-modal-stats-child';
        const className: string = 'qmx-stat-info-' + name;

        newItem.innerHTML = `
                <div class=${className}>
                    <div class="qmx-stat-header">
                        <span class="qmx-stat-nickname">${nickname}</span>
                    </div>
                    <div class="qmx-stat-details">
                        <span class="qmx-stat-item">0</span>
                    </div>
                </div>
            `;
        return newItem;
    },

    /**
     * 更新今日的数据，并同步更新平均每个红包金币数
     */
    updateTodayData: function () {
        const { allData, todayData } = this.ensureTodayDataExists();
        if (!todayData) return;
        // 计算平均
        todayData.avg = todayData.receivedCount
            ? parseFloat((todayData.total / todayData.receivedCount).toFixed(2))
            : 0.0;

        if (!Utils.lockChecker('douyu_qmx_stats_lock', this.updateTodayData.bind(this))) return;
        Utils.setLocalValueWithLock(
            'douyu_qmx_stats_lock',
            typedSettings.STATS_INFO_STORAGE_KEY,
            allData,
            '更新今日统计数据'
        );
        // 更新UI
        this.refreshUI(todayData);
    },

    /**
     * 设置统计数据
     * @param {keyof DailyStatsData} name - 统计键名
     * @param {number} value
     */
    set: function (name: keyof DailyStatsData, value: number) {
        const { allData, todayData } = this.ensureTodayDataExists();
        if (!todayData) return;
        todayData[name] = value;

        if (!Utils.lockChecker('douyu_qmx_stats_lock', this.set.bind(this), name, value)) return;
        Utils.setLocalValueWithLock(
            'douyu_qmx_stats_lock',
            typedSettings.STATS_INFO_STORAGE_KEY,
            allData,
            '更新统计数据'
        );

        this.refreshUI(todayData);
    },

    /**
     * 获取最新的金币记录并更新今日数据
     */
    getCoinListUpdate: async function () {
        // 获取金币历史数据
        const currentRoomId: string | null = Utils.getCurrentRoomId();
        if (!currentRoomId) {
            Utils.log('[统计] 无法获取当前房间ID，跳过金币记录更新。');
            return;
        }
        const coinList = await DouyuAPI.getCoinRecord(1, 100, currentRoomId, 3);
        // 处理今日数据
        const startOfToday: Date = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const filteredData = coinList.filter(
            (item) => item.createTime > startOfToday.getTime() / 1000
        );
        const totalCoin: number = filteredData.reduce((sum, item) => sum + item.balanceDiff, 0);
        const updateList: [keyof DailyStatsData, number][] = [
            ['receivedCount', filteredData.length],
            ['total', totalCoin],
        ];
        updateList.forEach(([name, value]) => {
            this.set(name, value);
        });
        // 更新本地数据
        this.updateTodayData();
    },

    /**
     * 刷新数据UI
     * @param {DailyStatsData} todayData - 今日数据对象
     */
    refreshUI: function (todayData: DailyStatsData) {
        for (const key in todayData) {
            try {
                const typedKey = key as keyof DailyStatsData;
                const element = globalValue.statElements.get(typedKey);
                if (!element) continue;
                this.contentTransition(element, todayData[typedKey].toString());
            } catch (e) {
                Utils.log(`[StatsInfo] UI刷新异常: ${e}`);
                continue;
            }
        }
    },

    /**
     * 移除过期数据
     */
    removeExpiredData: function () {
        const allData: AllStatsData = this.ensureTodayDataExists().allData;
        // 筛选最近七天的数据保留
        const newAllData = Object.keys(allData)
            .filter((dateString) => {
                const today: Date = new Date();
                today.setHours(0, 0, 0, 0);
                const date: Date = new Date(dateString);
                const diff: number = today.getTime() - date.getTime();
                const dayDiff: number = diff / (1000 * 60 * 60 * 24);
                return dayDiff <= 6;
            })
            .reduce((obj, key) => {
                return Object.assign(obj, { [key]: allData[key] });
            }, {});
        GM_setValue(typedSettings.STATS_INFO_STORAGE_KEY, newAllData);
        Utils.log('[数据统计]：已清理过期数据');
    },

    /**
     * 每日0点更新数据
     */
    updateDataForDailyReset: function () {
        const allData: AllStatsData | null = GM_getValue(
            typedSettings.STATS_INFO_STORAGE_KEY,
            null
        );
        if (!allData || typeof allData !== 'object') {
            this.ensureTodayDataExists();
            this.updateTodayData();
            this.removeExpiredData();
            return;
        }
        // 检查最后一条数据的日期是否为今天
        const lastDate: string | undefined = Object.keys(allData).at(-1);
        const nowDate: string = Utils.formatDateAsBeijing(new Date());
        if (lastDate !== nowDate) {
            // 日期已过，更新数据
            this.updateTodayData();
            this.removeExpiredData();
        }
    },

    /**
     * 检查是否需要更新统计数据
     */
    checkUpdate: function () {
        // 检查是否需要更新统计数据
        const state: GlobalStateData = GlobalState.get() as GlobalStateData;
        const tabList: HTMLElement | null = document.getElementById('qmx-tab-list');
        if (!tabList) return;
        const tabIds = Object.keys(state.tabs);
        tabIds.forEach((roomId) => {
            const tabData = state.tabs[roomId];
            const currentStatusText = tabData.statusText;
            // 判断是否更新统计数据
            if (typedSettings.SHOW_STATS_IN_PANEL) {
                if (currentStatusText.includes('领取到')) {
                    this.getCoinListUpdate();
                }
            }
        });
    },
};
