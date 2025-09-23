import { Utils } from './utils/utils'
import { initHackTimer } from './utils/HackTimer'
import { SETTINGS } from './modules/SettingsManager'
import { ControlPage } from './modules/ControlPage';
import { GlobalState } from './modules/GlobalState';
import { WorkerPage } from './modules/WorkerPage';
import { DanmuPro} from './modules/danmu/DanmuPro';

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

        const currentUrl = window.location.href;

        // 新的控制页识别逻辑：只要URL中出现靓号或第二房间号，无论格式如何，都识别为控制页
        const controlIds = [SETTINGS.CONTROL_ROOM_ID, SETTINGS.TEMP_CONTROL_ROOM_RID]
            .filter(Boolean); // 去除未填写的项
        Utils.log(`控制页识别ID列表: ${controlIds.join(', ')}`);
        Utils.log(`当前页面URL: ${currentUrl}`);
        const isControlRoom = controlIds.some(id =>
            currentUrl.includes(`/${id}`) ||
            currentUrl.includes(`/topic/`) && currentUrl.includes(`rid=${id}`)
        );

        if (isControlRoom) {
            ControlPage.init();
            if (SETTINGS.ENABLE_DANMU_PRO) {
                DanmuPro.init();
            }
            return; // 控制页逻辑独立，直接返回
        }

        // --- 工作页身份验证逻辑 ---
        const roomId = Utils.getCurrentRoomId();
        // 只有在明确是直播间页面的情况下才继续验证
        if (roomId && (currentUrl.match(/douyu\.com\/(?:beta\/)?(\d+)/) || currentUrl.match(/douyu\.com\/(?:beta\/)?topic\/.*rid=(\d+)/))) {
            
            const globalTabs = GlobalState.get().tabs;
            const pendingWorkers = GM_getValue('qmx_pending_workers', []);

            // 双重验证
            // 1. 检查自己是否已经是全局状态里公认的 worker
            // 2. 或者，检查自己是否是刚刚被打开、尚在等待名单中的 new worker
            if (globalTabs.hasOwnProperty(roomId) || pendingWorkers.includes(roomId)) {
                // 验证通过，授权 WorkerPage 初始化
                Utils.log(`[身份验证] 房间 ${roomId} 身份合法，授权初始化。`);
                //  如果是因为在全局状态中而通过的，顺便清理一下可能残留的 pending token
                const pendingIndex = pendingWorkers.indexOf(roomId);
                if (globalTabs.hasOwnProperty(roomId) && pendingIndex > -1) {
                    pendingWorkers.splice(pendingIndex, 1);
                    GM_setValue('qmx_pending_workers', pendingWorkers);
                    Utils.log(`[身份清理] 房间 ${roomId} 已是激活状态，清理残留的待处理标记。`);
                }
                
                WorkerPage.init();
            } else {
                // 验证失败，是普通页面
                Utils.log(`[身份验证] 房间 ${roomId} 未在全局状态或待处理列表中，脚本不活动。`);
            }

        } else {
            Utils.log("当前页面非控制页或工作页，脚本不活动。");
        }
    }
    // 延迟启动脚本，等待页面加载
    Utils.log(`脚本将在 ${SETTINGS.INITIAL_SCRIPT_DELAY / 1000} 秒后开始初始化...`);
    setTimeout(main, SETTINGS.INITIAL_SCRIPT_DELAY);

})();