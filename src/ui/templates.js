/**
 * @file    templates.js
 * @description 负责UI模板的定义和管理。
 */
import { SETTINGS } from '../modules/SettingsManager';

/**
 * 控制面板模板
 * @param {number} maxTabs - 最大标签页数量
 * @returns {string} - 控制面板的HTML模板
 */
export const mainPanelTemplate = (maxTabs) => `
    <div class="qmx-modal-header">
        <span>控制中心</span>
        <button id="qmx-modal-close-btn" class="qmx-modal-close-icon" title="关闭"></button>
    </div>
    <div class="qmx-stats-container">
        <div class="qmx-stats-toggle" id="qmx-stats-toggle">
            <button id="qmx-stats-left" class="qmx-stats-switcher"><</button>
            <span class="qmx-stats-indicator">▼</span>
            <span class="qmx-stats-label">今日统计</span>
            <button class="qmx-stats-refresh">⟳</button>
            <button id="qmx-stats-right" class="qmx-stats-switcher">></button>
        </div>
        <div class="qmx-stats-content" id="qmx-stats-content">
            <div class="qmx-modal-stats" id="qmx-stats-panel"></div>
        </div>
    </div>
    <div class="qmx-modal-content">
        <h3>监控面板 (<span id="qmx-active-tabs-count">0</span>/${maxTabs})</h3>
        <div id="qmx-tab-list"></div>
    </div>
    <div class="qmx-modal-footer">
        <button id="qmx-modal-settings-btn" class="qmx-modal-btn">设置</button>
        <button id="qmx-modal-close-all-btn" class="qmx-modal-btn danger">关闭所有</button>
        <button id="qmx-modal-open-btn" class="qmx-modal-btn primary">打开新房间</button>
    </div>
`;

/**
 * 创建一个带有单位的输入框
 * @param {string} id - 输入框的唯一标识符
 * @param {string} label - 输入框的标签文本
 * @param {Object} settingsMeta - 包含设置元数据的对象
 * @returns {string} - 生成的HTML字符串
 */
const createUnitInput = (id, label, settingsMeta) => {
    const meta = settingsMeta[id];
    return `
                <div class="qmx-settings-item">
                    <label for="${id}">
                        ${label}
                        <span class="qmx-tooltip-icon" data-tooltip-key="${id.replace('setting-', '')}">?</span>
                    </label>
                    <fieldset class="qmx-fieldset-unit">
                        <legend>${meta.unit}</legend>
                        <input type="number" class="qmx-input" id="${id}" value="${meta.value}">
                    </fieldset>
                </div>
            `;
};

/**
 * 创建设置面板的HTML模板
 * @param {Object} SETTINGS - 包含所有设置的对象
 * @returns {string} - 生成的HTML字符串
 */
export const settingsPanelTemplate = (SETTINGS) => {
    const settingsMeta = {
        'setting-initial-script-delay': { value: SETTINGS.INITIAL_SCRIPT_DELAY / 1000, unit: '秒' },
        'setting-auto-pause-delay': { value: SETTINGS.AUTO_PAUSE_DELAY_AFTER_ACTION / 1000, unit: '秒' },
        'setting-unresponsive-timeout': { value: SETTINGS.UNRESPONSIVE_TIMEOUT / 60000, unit: '分钟' },
        'setting-red-envelope-timeout': { value: SETTINGS.RED_ENVELOPE_LOAD_TIMEOUT / 1000, unit: '秒' },
        'setting-popup-wait-timeout': { value: SETTINGS.POPUP_WAIT_TIMEOUT / 1000, unit: '秒' },
        'setting-worker-loading-timeout': { value: SETTINGS.ELEMENT_WAIT_TIMEOUT / 1000, unit: '秒' },
        'setting-close-tab-delay': { value: SETTINGS.CLOSE_TAB_DELAY / 1000, unit: '秒' },
        'setting-api-retry-delay': { value: SETTINGS.API_RETRY_DELAY / 1000, unit: '秒' },
        'setting-switching-cleanup-timeout': { value: SETTINGS.SWITCHING_CLEANUP_TIMEOUT / 1000, unit: '秒' },
        'setting-healthcheck-interval': { value: SETTINGS.HEALTHCHECK_INTERVAL / 1000, unit: '秒' },
        'setting-disconnected-grace-period': { value: SETTINGS.DISCONNECTED_GRACE_PERIOD / 1000, unit: '秒' },
        'setting-stats-update-interval': { value: SETTINGS.STATS_UPDATE_INTERVAL / 1000, unit: '秒' },
    };

    return `
        <div class="qmx-settings-header">
            <div class="qmx-settings-tabs">
                <button class="tab-link active" data-tab="basic">基本设置</button>
                <button class="tab-link" data-tab="perf">性能与延迟</button>
                <button class="tab-link" data-tab="advanced">高级设置</button>
                <button class="tab-link" data-tab="danmupro">弹幕助手</button>
                <button class="tab-link" data-tab="about">关于</button>
                <!-- 主题模式切换开关 -->
                <div class="qmx-settings-item">
                    <div class="theme-switch-wrapper">
                        <label class="theme-switch">
                            <input type="checkbox" id="setting-theme-mode" ${SETTINGS.THEME === 'dark' ? 'checked' : ''}>

                            <!-- 1. 背景轨道：只负责展开和收缩的动画 -->
                            <span class="slider-track"></span>

                            <!-- 2. 滑块圆点：只负责左右移动和图标切换 -->
                            <span class="slider-dot">
                                <span class="icon sun">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <circle cx="12" cy="12" r="5"></circle>
                                        <line x1="12" y1="1" x2="12" y2="3"></line>
                                        <line x1="12" y1="21" x2="12" y2="23"></line>
                                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                                        <line x1="1" y1="12" x2="3" y2="12"></line>
                                        <line x1="21" y1="12" x2="23" y2="12"></line>
                                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                                    </svg>
                                </span>
                                <span class="icon moon">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-3.51 1.713-6.636 4.398-8.552a.75.75 0 01.818.162z" clip-rule="evenodd"></path></svg>
                                </span>
                            </span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
        <div class="qmx-settings-content">
            <!-- ==================== Tab 1: 基本设置 ==================== -->
            <div id="tab-basic" class="tab-content active">
                <div class="qmx-settings-grid">
                    <div class="qmx-settings-item">
                        <label for="setting-control-room-id">控制室房间号 <span class="qmx-tooltip-icon" data-tooltip-key="control-room">?</span></label>
                        <input type="number" class="qmx-input" id="setting-control-room-id" value="${SETTINGS.CONTROL_ROOM_ID}">
                    </div>
                    <div class="qmx-settings-item"></div>
                    <div class="qmx-settings-item">
                        <label>自动暂停后台视频 <span class="qmx-tooltip-icon" data-tooltip-key="auto-pause">?</span></label>
                        <label class="qmx-toggle">
                            <input type="checkbox" id="setting-auto-pause" ${SETTINGS.AUTO_PAUSE_ENABLED ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="qmx-settings-item">
                        <label>展示数据统计 <span class="qmx-tooltip-icon" data-tooltip-key="stats-info">?</span></label>
                        <label class="qmx-toggle">
                            <input type="checkbox" id="setting-stats-info" ${SETTINGS.SHOW_STATS_IN_PANEL ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="qmx-settings-item">
                        <label>启用校准模式 <span class="qmx-tooltip-icon" data-tooltip-key="calibration-mode">?</span></label>
                        <label class="qmx-toggle">
                            <input type="checkbox" id="setting-calibration-mode" ${SETTINGS.CALIBRATION_MODE_ENABLED ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="qmx-settings-item">
                        <label>启用弹幕助手😋<span class="qmx-tooltip-icon" data-tooltip-key="danmupro-mode">?</span></label>
                        <label class="qmx-toggle">
                            <input type="checkbox" id="setting-danmupro-mode" ${SETTINGS.ENABLE_DANMU_PRO ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="qmx-settings-item">
                        <label>达到上限后的行为</label>
                        <div class="qmx-select" data-target-id="setting-daily-limit-action">
                            <div class="qmx-select-styled"></div>
                            <div class="qmx-select-options"></div>
                            <select id="setting-daily-limit-action" style="display: none;">
                                <option value="STOP_ALL" ${
                                    SETTINGS.DAILY_LIMIT_ACTION === 'STOP_ALL' ? 'selected' : ''
                                }>直接关停所有任务</option>
                                <option value="CONTINUE_DORMANT" ${
                                    SETTINGS.DAILY_LIMIT_ACTION === 'CONTINUE_DORMANT' ? 'selected' : ''
                                }>进入休眠模式，等待刷新</option>
                            </select>
                        </div>
                    </div>
                    <div class="qmx-settings-item">
                        <label>控制中心显示模式</label>
                        <div class="qmx-select" data-target-id="setting-modal-mode">
                            <div class="qmx-select-styled"></div>
                            <div class="qmx-select-options"></div>
                            <select id="setting-modal-mode" style="display: none;">
                                <option value="floating" ${
                                    SETTINGS.MODAL_DISPLAY_MODE === 'floating' ? 'selected' : ''
                                }>浮动窗口</option>
                                <option value="centered" ${
                                    SETTINGS.MODAL_DISPLAY_MODE === 'centered' ? 'selected' : ''
                                }>屏幕居中</option>
                                <option value="inject-rank-list" ${
                                    SETTINGS.MODAL_DISPLAY_MODE === 'inject-rank-list' ? 'selected' : ''
                                }>替换排行榜显示</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ==================== Tab 2: 性能与延迟 ==================== -->
            <div id="tab-perf" class="tab-content">
                <div class="qmx-settings-grid">
                    ${createUnitInput('setting-initial-script-delay', '脚本初始启动延迟', settingsMeta)}
                    ${createUnitInput('setting-auto-pause-delay', '领取后暂停延迟', settingsMeta)}
                    ${createUnitInput('setting-unresponsive-timeout', '工作页失联超时', settingsMeta)}
                    ${createUnitInput('setting-red-envelope-timeout', '红包活动加载超时', settingsMeta)}
                    ${createUnitInput('setting-popup-wait-timeout', '红包弹窗等待超时', settingsMeta)}
                    ${createUnitInput('setting-worker-loading-timeout', '播放器加载超时', settingsMeta)}
                    ${createUnitInput('setting-close-tab-delay', '关闭标签页延迟', settingsMeta)}
                    ${createUnitInput('setting-switching-cleanup-timeout', '切换中状态兜底超时', settingsMeta)}
                    ${createUnitInput('setting-healthcheck-interval', '哨兵健康检查间隔', settingsMeta)}
                    ${createUnitInput('setting-disconnected-grace-period', '断开连接清理延迟', settingsMeta)}
                    ${createUnitInput('setting-api-retry-delay', 'API重试延迟', settingsMeta)}
                    ${createUnitInput('setting-stats-update-interval', '统计信息更新间隔', settingsMeta)}
                    
                    <div class="qmx-settings-item" style="grid-column: 1 / -1;">
                        <label>模拟操作延迟范围 (秒) <span class="qmx-tooltip-icon" data-tooltip-key="range-delay">?</span></label>
                        <div class="qmx-range-slider-wrapper">
                            <div class="qmx-range-slider-container">
                                <div class="qmx-range-slider-track-container"><div class="qmx-range-slider-progress"></div></div>
                                <input type="range" id="setting-min-delay" min="0.1" max="5" step="0.1" value="${
                                    SETTINGS.MIN_DELAY / 1000
                                }">
                                <input type="range" id="setting-max-delay" min="0.1" max="5" step="0.1" value="${
                                    SETTINGS.MAX_DELAY / 1000
                                }">
                            </div>
                            <div class="qmx-range-slider-values"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ==================== Tab 3: 高级设置 ==================== -->
            <div id="tab-advanced" class="tab-content">
                <div class="qmx-settings-grid">
                    <div class="qmx-settings-item">
                        <label for="setting-max-tabs">最大工作标签页数量 <span class="qmx-tooltip-icon" data-tooltip-key="max-worker-tabs">?</span></label>
                        <input type="number" class="qmx-input" id="setting-max-tabs" value="${SETTINGS.MAX_WORKER_TABS}">
                    </div>
                    <div class="qmx-settings-item">
                        <label for="setting-api-fetch-count">单次API获取房间数 <span class="qmx-tooltip-icon" data-tooltip-key="api-room-fetch-count">?</span></label>
                        <input type="number" class="qmx-input" id="setting-api-fetch-count" value="${
                            SETTINGS.API_ROOM_FETCH_COUNT
                        }">
                    </div>
                    <div class="qmx-settings-item">
                        <label for="setting-api-retry-count">API请求重试次数 <span class="qmx-tooltip-icon" data-tooltip-key="api-retry-count">?</span></label>
                        <input type="number" class="qmx-input" id="setting-api-retry-count" value="${SETTINGS.API_RETRY_COUNT}">
                    </div>

                    

                    <!-- 新增：添加两个空的占位符，使网格平衡为 2x3 -->
                    <div class="qmx-settings-item"></div>
                    <div class="qmx-settings-item"></div>
                </div>
            </div>

            <!-- ==================== Tab 4: 弹幕助手 ==================== -->
            <div id="tab-danmupro" class="tab-content">
                <h4>关于斗鱼弹幕助手功能</h4>
                <ul class="qmx-styled-list">
                    <li>启用后，可以在弹幕输入框中使用自动弹幕推荐等功能。</li>
                    <li>弹幕智能补全：在聊天输入框输入时，根据关键字自动匹配并显示相关的弹幕模板。</li>
                    <li>全键盘操作：
                        <ul>
                            <li>1. 正常输入模式：打出关键字如‘niko’‘三楼’</li>
                            <li>2. 如果弹幕库中有匹配到的话，会在输入框上方显示几个候选项</li>
                            <li>3. 点击 <code>↑</code> 键进入选择模式</li>
                            <li>4. 点击 <code>←</code> / <code>→</code> 在候选项之间导航</li>
                            <li>5. 点击 <code>Enter</code> 选择并填充弹幕（连点两下<code>Enter</code>就是直接发送弹幕）</li>
                            <li>6. 点击 <code>↓</code> 退出选择模式回到正常输入模式，或点击 <code>Esc</code> 关闭候选框</li>
                            <li>在第2步之后也可以直接鼠标点击选择候选项填充到输入框</li>
                        </ul>
                    </li>
                    <li>长文本预览：当鼠标悬停或键盘选择到内容过长的候选项时，会显示一个悬浮框来展示完整内容。</li>
                </ul>
            </div>      
            <!-- ==================== Tab 5: 关于 ==================== -->
            <div id="tab-about" class="tab-content">
                <!-- 调试工具 - 仅在开发时启用
                <h4>调试工具 <span style="color: #ff6b6b;">⚠️ 仅供测试使用</span></h4>
                <div class="qmx-settings-grid">
                    <div class="qmx-settings-item">
                        <label>模拟达到每日上限</label>
                        <button id="test-daily-limit-btn" class="qmx-modal-btn" style="background-color: #ff6b6b; color: white;">
                            设置为已达上限
                        </button>
                        <small style="color: #888; display: block; margin-top: 5px;">
                            点击后将模拟达到每日红包上限，触发休眠模式（如果启用）
                        </small>
                    </div>
                    <div class="qmx-settings-item">
                        <label>重置每日上限状态</label>
                        <button id="reset-daily-limit-btn" class="qmx-modal-btn">
                            重置上限状态
                        </button>
                        <small style="color: #888; display: block; margin-top: 5px;">
                            清除上限标记，恢复正常运行模式
                        </small>
                    </div>
                </div>
                -->
                
                <h4>关于脚本 <span class="version-tag">v2.0.8</span></h4>
                <h4>致谢</h4>
                <ul class="qmx-styled-list">
                    <li>本脚本基于<a href="https://greasyfork.org/zh-CN/users/1453821-ysl-ovo" target="_blank" rel="noopener noreferrer">ysl-ovo</a>的插件<a href="https://greasyfork.org/zh-CN/scripts/532514-%E6%96%97%E9%B1%BC%E5%85%A8%E6%B0%91%E6%98%9F%E6%8E%A8%E8%8D%90%E8%87%AA%E5%8A%A8%E9%A2%86%E5%8F%96" target="_blank" rel="noopener noreferrer">《斗鱼全民星推荐自动领取》</a>
                        进行一些功能改进(也许)与界面美化，同样遵循MIT许可证开源。感谢原作者的分享</li>
                    <li>兼容斗鱼新版UI的相关功能与项目重构主要由<a href="https://github.com/Truthss" target="_blank" rel="noopener noreferrer">@Truthss</a> 贡献，非常感谢！</li>
                </ul>
                <h4>一些tips</h4>
                <ul class="qmx-styled-list">
                    <li>每天大概1000左右金币到上限</li>
                    <li>注意这个活动到晚上的时候，100/50/20星光棒的选项可能空了(奖池对应项会变灰)这时候攒金币过了12点再抽，比较有性价比</li>
                    <li>后台标签页有时会在还剩几秒时卡死在红包弹窗界面(标签页倒计时不动了)，然后就死循环了。目前已部分修复此问题</li>
                    <li>脚本还是bug不少，随缘修了＞︿＜</li>
                    <li>DouyuEx 的“阻止P2P上传”功能位置：点击精灵球->从左往右第四个🛠️样貌的选项->右侧菜单顶部 </li>
                    <li>启用统计功能需要把"油猴管理面板->设置->安全->允许脚本访问 Cookie"改为ALL！！',
                </ul>
                <h4>脚本更新日志 (v2.0.8)</h4>
                <ul class="qmx-styled-list">
                    <li>【修复】适配斗鱼星推荐API变动</li>
                    <li>【新增】在控制面板中显示统计信息，记录每日领取的红包数量和金币总额。</li>
                </ul>
                <h4>源码与社区</h4>
                <ul class="qmx-styled-list">
                    <li>可以在 <a href="https://github.com/ienone/douyu-qmx-pro/" target="_blank" rel="noopener noreferrer">GitHub</a> 查看本脚本源码</li>
                    <li>发现BUG或有功能建议，欢迎提交 <a href="https://github.com/ienone/douyu-qmx-pro/issues" target="_blank" rel="noopener noreferrer">Issue</a>（不过大概率不会修……）</li>
                    <li>如果你有能力进行改进，非常欢迎提交 <a href="https://github.com/ienone/douyu-qmx-pro/pulls" target="_blank" rel="noopener noreferrer">Pull Request</a>！</li>
                </ul>
            </div>
        </div>
        <div class="qmx-settings-footer">
            <button id="qmx-settings-cancel-btn" class="qmx-modal-btn">取消</button>
            <button id="qmx-settings-reset-btn" class="qmx-modal-btn danger">恢复默认</button>
            <button id="qmx-settings-save-btn" class="qmx-modal-btn primary">保存并刷新</button>
        </div>
        `;
};
