import { Utils } from './utils/utils'
import { initHackTimer } from './utils/HackTimer'
import { SETTINGS } from './modules/SettingsManager'
// 静态导入
import { ControlPage } from './modules/ControlPage';
import { WorkerPage } from './modules/WorkerPage';
import { GlobalState } from './modules/GlobalState';
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

        const currentUrl = window.location.href;

        // 新的控制页识别逻辑
        const controlIds = [SETTINGS.CONTROL_ROOM_ID, SETTINGS.TEMP_CONTROL_ROOM_RID]
            .filter(Boolean);
        Utils.log(`控制页识别ID列表: ${controlIds.join(', ')}`);
        
        const isControlRoom = controlIds.some(id =>
            currentUrl.includes(`/${id}`) ||
            (currentUrl.includes(`/topic/`) && currentUrl.includes(`rid=${id}`))
        );

        if (isControlRoom) {
            ControlPage.init();
            if (__ENABLE_DANMU_PRO__ && SETTINGS.ENABLE_DANMU_PRO) {
                DanmuPro.init();
            }
            return;
        }

        // --- 工作页身份验证逻辑 ---
        const roomId = Utils.getCurrentRoomId();
        if (roomId && (currentUrl.match(/douyu\.com\/(?:beta\/)?(\d+)/) || currentUrl.match(/douyu\.com\/(?:beta\/)?topic\/.*rid=(\d+)/))) {
            
            const globalTabs = GlobalState.get().tabs; // 现在 GlobalState 已定义
            const pendingWorkers = GM_getValue('qmx_pending_workers', []);

            if (Object.hasOwn(globalTabs, roomId) || pendingWorkers.includes(roomId)) {
                Utils.log(`[身份验证] 房间 ${roomId} 身份合法，授权初始化。`);
                const pendingIndex = pendingWorkers.indexOf(roomId);
                if (Object.hasOwn(globalTabs, roomId) && pendingIndex > -1) {
                    pendingWorkers.splice(pendingIndex, 1);
                    GM_setValue('qmx_pending_workers', pendingWorkers);
                }
                
                WorkerPage.init();
            } else {
                Utils.log(`[身份验证] 房间 ${roomId} 未在全局状态或待处理列表中，脚本不活动。`);
            }

        } else {
            Utils.log("当前页面非控制页或工作页，脚本不活动。");
        }
    }

    Utils.log(`脚本将在 ${SETTINGS.INITIAL_SCRIPT_DELAY / 1000} 秒后开始初始化...`);
    setTimeout(main, SETTINGS.INITIAL_SCRIPT_DELAY);

})();