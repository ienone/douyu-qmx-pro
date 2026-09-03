import { Utils } from './utils/utils'
import { initHackTimer } from './utils/HackTimer'
import { SETTINGS } from './modules/SettingsManager'
// 静态导入
import { ControlPage } from './modules/ControlPage';
import { DanmuPro } from './modules/danmu/DanmuPro';

(function() {
    'use strict';
    /**
     * =================================================================================
     * 脚本主入口 (Main)
     * ---------------------------------------------------------------------------------
     * 判断当前页面类型，并调用相应的模块进行初始化。
     * =================================================================================
     */
    function main() {
        initHackTimer('HackTimerWorker.js');

        if (!__ENABLE_STAR_CORE__) {
            Utils.log('星推荐核心已禁用，仅启动弹幕助手。');
            if (__ENABLE_DANMU_PRO__) DanmuPro.init();
            return;
        }

        const currentUrl = new URL(window.location.href);
        const pathRoomId = currentUrl.pathname.match(/^\/(?:beta\/)?(\d+)\/?$/)?.[1] || '';
        const topicRoomId = currentUrl.pathname.includes('/topic/')
            ? currentUrl.searchParams.get('rid') || ''
            : '';
        const controlIds = [SETTINGS.CONTROL_ROOM_ID, SETTINGS.TEMP_CONTROL_ROOM_RID]
            .filter(Boolean).map(String);
        const controlIdSet = new Set(controlIds);
        Utils.log(`控制页识别ID列表: ${controlIds.join(', ')}`);
        const isControlRoom = controlIdSet.has(pathRoomId) || controlIdSet.has(topicRoomId);

        if (isControlRoom) {
            ControlPage.init();
            if (__ENABLE_DANMU_PRO__ && SETTINGS.ENABLE_DANMU_PRO) {
                DanmuPro.init();
            }
            return;
        }

        const roomId = Utils.getCurrentRoomId();
        if (roomId) {
            if (__ENABLE_DANMU_PRO__ && SETTINGS.ENABLE_DANMU_PRO) DanmuPro.init();
        } else {
            Utils.log('当前页面非控制页或直播间，脚本不活动。');
        }
    }

    Utils.log(`脚本将在 ${SETTINGS.INITIAL_SCRIPT_DELAY / 1000} 秒后开始初始化...`);
    setTimeout(main, SETTINGS.INITIAL_SCRIPT_DELAY);

})();
