/**
 * @file StatsInfo.js
 * @description 负责统计面板的UI和数据更新
 */
import '../styles/ControlPanel-refactored.css';
import { SETTINGS } from './SettingsManager.js';
import { Utils } from '../utils/utils.js';
import { DouyuAPI } from '../utils/DouyuAPI.js';

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

        // 初始化数据
        const nowDate = Utils.formatDateAsBeijing(new Date());
        let dataObj = this.createDataObj(nowDate);
        if (!GM_getValue(SETTINGS.STATS_INFO_STORAGE_KEY, null)) {
            GM_setValue(SETTINGS.STATS_INFO_STORAGE_KEY, dataObj);
        }
        this.updateTodayData();

        // 获取最新的金币记录并更新今日数据
        await this.getCoinListUpdate();

        // 去除过期数据
        this.removeExpiredData();

        this.bindEvents();

        // 每日0点更新数据
        setInterval(() => {
            this.updateDataForDailyReset();
        }, 60 * 1000);
    },

    bindEvents: function () {
        // 绑定刷新按钮事件
        const refreshButton = document.querySelector('.qmx-stats-refresh');
        if (!refreshButton) {
            return;
        }
        refreshButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            
            // 旋转动画
            void this.offsetWidth; // 触发重绘以重新应用动画
            refreshButton.classList.add('rotating');
            setTimeout(() => {
                refreshButton.classList.remove('rotating');
            }, 1000);

            await this.getCoinListUpdate();
        });
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
     * 初始化一日的数据
     * @param {string} date - 今日日期 ${year}-${month}-${day}
     * @returns {{date: {
     *  receivedCount: number,
     *  avg: number,
     *  total: number
     * }}} - 初始化值为0的统计数据
     */
    createDataObj: function (date) {
        return {
            [date]: {
                receivedCount: 0,
                avg: 0,
                total: 0,
            },
        };
    },

    /**
     * 更新今日的数据，并同步更新平均每个红包金币数
     */
    updateTodayData: function () {
        let allData = GM_getValue(SETTINGS.STATS_INFO_STORAGE_KEY, null);
        if (!allData) {
            return;
        }

        const today = Utils.formatDateAsBeijing(new Date());
        let todayData = allData?.[today];
        if (!todayData) {
            // 添加今日初始数据
            Object.assign(allData, this.createDataObj(today));
            GM_setValue(SETTINGS.STATS_INFO_STORAGE_KEY, allData);
            this.updateTodayData();
            return;
        }
        // 计算平均
        todayData['avg'] = todayData['total'] / todayData['receivedCount'] || 0;
        todayData['avg'] = todayData['avg'].toFixed(2);
        this.set('avg', todayData['avg']);
        // 更新UI
        this.refreshUI(todayData);
    },

    /**
     * 验证存储数据是否完整
     * @param data
     * @returns {boolean}
     */
    validateAllData: function (data) {
        if (!data) {
            Utils.log('统计数据错误');
            return false;
        }
        const today = Utils.formatDateAsBeijing(new Date());
        let todayData = data?.[today];
        if (!todayData) {
            Utils.log('今日统计数据错误');
            return false;
        }
        return true;
    },

    /**
     * 设置统计数据
     * @param {string} name - 统计名String 包含 receivedCount total avg
     * @param {number} value
     */
    set: function (name, value) {
        const lockKey = 'douyu_qmx_stats_lock';
        if (!Utils.lockChecker(lockKey, () => this.set(), name, value)) {
            return;
        }
        // 验证数据格式
        let allData = GM_getValue(SETTINGS.STATS_INFO_STORAGE_KEY, null);
        if (!this.validateAllData(allData)) {
            return;
        }
        const today = Utils.formatDateAsBeijing(new Date());
        let todayData = allData?.[today];
        todayData[name] = value;
        Utils.setLocalValueWithLock(
            lockKey,
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
        const coinList = await DouyuAPI.getCoinRecord(1, 100, 3);
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
        for (let todayDataKey in todayData) {
            let dataName = document.querySelector(`.qmx-stat-info-${todayDataKey}`);
            let item = dataName.querySelector('.qmx-stat-item');
            item.textContent = todayData[todayDataKey];
        }
    },

    /**
     * 移除过期数据
     */
    removeExpiredData: function () {
        const allData = GM_getValue(SETTINGS.STATS_INFO_STORAGE_KEY);
        if (!allData) {
            Utils.log('获取本地历史数据失败');
        }
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

    updateDataForDailyReset: function () {
        const allData = GM_getValue(SETTINGS.STATS_INFO_STORAGE_KEY, null);
        if (!allData) {
            Utils.log('更新每日数据时本地数据错误，跳过');
            return;
        }

        // 检查最后一条数据的日期是否为今天
        const lastDate = Object.keys(allData).at(-1);
        const nowDate = Utils.formatDateAsBeijing(new Date());
        if (lastDate !== nowDate) {
            // 日期已过，更新数据
            this.updateTodayData();
            this.removeExpiredData();
        }
    },
};
