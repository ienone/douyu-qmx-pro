/**
 * @file StatsInfo.js
 * @description 负责统计面板的UI和数据更新
 */
import '../styles/ControlPanel-refactored.css';
import { SETTINGS } from './SettingsManager.js';
import { Utils } from '../utils/utils.js';
import { DouyuAPI } from '../utils/DouyuAPI.js';
import { GlobalState } from './GlobalState.js';

const globalValue = {
    currentDatePage: Utils.formatDateAsBeijing(new Date()), // 当前查看的日期页面
    updateIntervalID: null,
};

export const StatsInfo = {
    init: async function () {
        // 初始化组件
        const stats = document.getElementById('qmx-stats-panel');
        [
            ['receivedCount', '已领个数'],
            ['total', '总金币'],
            ['avg', '平均每个'],
        ].forEach(([name, nickname]) => {
            stats.appendChild(this.initRender(name, nickname));
        });

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

    updateInterval: function () {
        if (globalValue.updateIntervalID) {
            clearInterval(globalValue.updateIntervalID);
            globalValue.updateIntervalID = null;
        }
        globalValue.updateIntervalID = setInterval(() => {
            // 更新数据
            this.checkUpdate();
        }, SETTINGS.STATS_UPDATE_INTERVAL);
    },

    /**
     * 统一初始化和校验今日数据
     * @returns {Object} 包含所有数据和今日数据的对象
     */
    ensureTodayDataExists: function () {
        const today = Utils.formatDateAsBeijing(new Date());
        let allData = GM_getValue(SETTINGS.STATS_INFO_STORAGE_KEY, null);
        if (!allData || typeof allData !== 'object') {
            allData = {};
        }
        if (!allData[today]) {
            allData[today] = {
                receivedCount: 0,
                avg: 0,
                total: 0,
            };
            GM_setValue(SETTINGS.STATS_INFO_STORAGE_KEY, allData);
        }
        return { allData, todayData: allData[today], today };
    },

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

    bindRefreshEvent: function () {
        // 绑定刷新按钮事件
        const refreshButton = document.querySelector('.qmx-stats-refresh');
        const today = Utils.formatDateAsBeijing(new Date());
        if (!refreshButton) {
            throw new Error('无法找到刷新按钮元素');
        }

        if (globalValue.currentDatePage !== today) {
            refreshButton.classList.add('disabled');
            refreshButton.onclick = null;
            return;
        }
        refreshButton.classList.remove('disabled');
        refreshButton.onclick = async (e) => {
            e.stopPropagation();

            // 旋转动画
            void this.offsetWidth; // 触发重绘以重新应用动画
            refreshButton.classList.add('rotating');
            setTimeout(() => {
                refreshButton.classList.remove('rotating');
            }, 1000);

            await this.getCoinListUpdate();
        };
    },
    // TODO 查看历史时禁止刷新

    /**
     * 通用的绑定切换按钮函数
     * @param {string} direction - 方向，'left' 或 'right'
     */
    bindSwitcher: function (direction) {
        const { allData, _, today } = this.ensureTodayDataExists();
        const statsLable = document.querySelector('.qmx-stats-label');
        globalValue.currentDatePage = globalValue.currentDatePage ?? today;
        const dateList = Object.keys(allData);
        const currentIndex = dateList.indexOf(globalValue.currentDatePage);

        const button = document.querySelector(`#qmx-stats-${direction}`);
        if (!button) {
            throw new Error(`无法找到${direction === 'left' ? '左' : '右'}切换按钮元素`);
        }

        // 检查是否需要禁用按钮
        const shouldDisableButton =
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
            const newIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
            // 确保索引有效
            if (newIndex >= 0 && newIndex < dateList.length) {
                globalValue.currentDatePage = dateList[newIndex];
                this.refreshUI(allData[globalValue.currentDatePage]);
                this.bindEvents();
            }
            // 更新标签文本
            if (globalValue.currentDatePage !== today) {
                statsLable.textContent = globalValue.currentDatePage;
            } else {
                statsLable.textContent = '统计面板';
            }
            // 刷新更新数据计时器
            if (globalValue.currentDatePage === today) {
                this.updateInterval();
                // 执行一次更新，防止切换后数据不及时
                this.getCoinListUpdate();
            } else {
                // 停止更新
                clearInterval(globalValue.updateIntervalID);
                globalValue.updateIntervalID = null;
            }
        };
    },

    bindSwitcherLeft: function () {
        this.bindSwitcher('left');
    },

    bindSwitcherRight: function () {
        this.bindSwitcher('right');
    },

    /**
     * 初始化组件
     * @param {string} name - 小组件名字
     * @param {string} nickname - 小组件中文名
     * @returns {HTMLDivElement}
     */
    initRender: function (name, nickname) {
        const newItem = document.createElement('div');
        newItem.className = 'qmx-modal-stats-child';
        const className = 'qmx-stat-info-' + name;

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
            ? (todayData.total / todayData.receivedCount).toFixed(2)
            : 0.0;

        if (!Utils.lockChecker('douyu_qmx_stats_lock', this.updateTodayData.bind(this))) return;
        Utils.setLocalValueWithLock(
            'douyu_qmx_stats_lock',
            SETTINGS.STATS_INFO_STORAGE_KEY,
            allData,
            '更新今日统计数据'
        );
        // 更新UI
        this.refreshUI(todayData);
    },

    /**
     * 设置统计数据
     * @param {string} name - 统计名String 包含 receivedCount total avg
     * @param {number} value
     */
    set: function (name, value) {
        const { allData, todayData } = this.ensureTodayDataExists();
        if (!todayData) return;
        todayData[name] = value;

        if (!Utils.lockChecker('douyu_qmx_stats_lock', this.set.bind(this), name, value)) return;
        Utils.setLocalValueWithLock(
            'douyu_qmx_stats_lock',
            SETTINGS.STATS_INFO_STORAGE_KEY,
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
        const currentRoomId = Utils.getCurrentRoomId();
        if (!currentRoomId) {
            Utils.log('[统计] 无法获取当前房间ID，跳过金币记录更新。');
            return;
        }
        const coinList = await DouyuAPI.getCoinRecord(1, 100, currentRoomId, 3);
        // 处理今日数据
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const filteredData = coinList.filter((item) => item.createTime > startOfToday / 1000);
        const totalCoin = filteredData.reduce((sum, item) => sum + item.balanceDiff, 0);
        [
            ['receivedCount', filteredData.length],
            ['total', totalCoin],
        ].forEach(([name, value]) => {
            this.set(name, value);
        });
        // 更新本地数据
        this.updateTodayData();
    },

    /**
     * 刷新数据UI
     * @param {Object} todayData - 今日数据对象
     */
    refreshUI: function (todayData) {
        for (let key in todayData) {
            try {
                const dataName = document.querySelector(`.qmx-stat-info-${key}`);
                if (!dataName) continue;
                const item = dataName.querySelector('.qmx-stat-item');
                if (!item) continue;
                item.textContent = todayData[key];
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
        const allData = this.ensureTodayDataExists().allData;
        // 筛选最近两天的数据保留
        let newAllData = Object.keys(allData)
            .filter((dateString) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const date = new Date(dateString);
                const diff = today - date;
                const dayDiff = diff / (1000 * 60 * 60 * 24);
                return dayDiff <= 1;
            })
            .reduce((obj, key) => {
                return Object.assign(obj, { [key]: allData[key] });
            }, {});
        GM_setValue(SETTINGS.STATS_INFO_STORAGE_KEY, newAllData);
        Utils.log('[数据统计]：已清理过期数据');
    },

    /**
     * 每日0点更新数据
     */
    updateDataForDailyReset: function () {
        const allData = this.ensureTodayDataExists().allData;
        // 检查最后一条数据的日期是否为今天
        const lastDate = Object.keys(allData).at(-1);
        const nowDate = Utils.formatDateAsBeijing(new Date());
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
        const state = GlobalState.get();
        const tabList = document.getElementById('qmx-tab-list');
        if (!tabList) return;
        const tabIds = Object.keys(state.tabs);
        tabIds.forEach((roomId) => {
            const tabData = state.tabs[roomId];
            let currentStatusText = tabData.statusText;
            // 判断是否更新统计数据
            if (SETTINGS.SHOW_STATS_IN_PANEL) {
                if (currentStatusText.includes('领取到')) {
                    this.getCoinListUpdate();
                }
            }
        });
    },
};
