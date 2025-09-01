/**
 * @file    templates.js
 * @description 负责UI模板的定义和管理。
 */
import { SETTINGS } from "../modules/SettingsManager";

/**
 * 控制面板模板
 * @param {number} maxTabs - 最大标签页数量
 * @returns {string} - 控制面板的HTML模板
 */
export const mainPanelTemplate = (maxTabs) =>`
    <div class="qmx-modal-header">
        <span>控制中心</span>
        <button id="qmx-modal-close-btn" class="qmx-modal-close-icon" title="关闭"></button>
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
                        <span class="qmx-tooltip-icon" data-tooltip-key="${id.replace( "setting-", "" )}">?</span>
                    </label>
                    <fieldset class="qmx-fieldset-unit">
                        <legend>${meta.unit}</legend>
                        <input type="number" id="${id}" value="${meta.value}">
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
    };

    return`
        <div class="qmx-settings-header">
            <div class="qmx-settings-tabs">
                <button class="tab-link active" data-tab="basic">基本设置</button>
                <button class="tab-link" data-tab="perf">性能与延迟</button>
                <button class="tab-link" data-tab="advanced">高级设置</button>
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
                        <input type="number" id="setting-control-room-id" value="${SETTINGS.CONTROL_ROOM_ID}">
                    </div>
                    <div class="qmx-settings-item">
                        <label>自动暂停后台视频 <span class="qmx-tooltip-icon" data-tooltip-key="auto-pause">?</span></label>
                        <label class="qmx-toggle">
                            <input type="checkbox" id="setting-auto-pause" ${SETTINGS.AUTO_PAUSE_ENABLED ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="qmx-settings-item">
                        <label>达到上限后的行为</label>
                        <div class="qmx-select" data-target-id="setting-daily-limit-action">
                            <div class="qmx-select-styled"></div>
                            <div class="qmx-select-options"></div>
                            <select id="setting-daily-limit-action" style="display: none;">
                                <option value="STOP_ALL" ${SETTINGS.DAILY_LIMIT_ACTION === 'STOP_ALL' ? 'selected' : ''}>直接关停所有任务</option>
                                <option value="CONTINUE_DORMANT" ${SETTINGS.DAILY_LIMIT_ACTION === 'CONTINUE_DORMANT' ? 'selected' : ''}>进入休眠模式，等待刷新</option>
                            </select>
                        </div>
                    </div>
                    <div class="qmx-settings-item">
                        <label>控制中心显示模式</label>
                        <div class="qmx-select" data-target-id="setting-modal-mode">
                            <div class="qmx-select-styled"></div>
                            <div class="qmx-select-options"></div>
                            <select id="setting-modal-mode" style="display: none;">
                                <option value="floating" ${SETTINGS.MODAL_DISPLAY_MODE ===    'floating' ? 'selected' : ''}>浮动窗口</option>
                                <option value="centered" ${SETTINGS.MODAL_DISPLAY_MODE ===    'centered' ? 'selected' : ''}>屏幕居中</option>
                                <option value="inject-rank-list" ${SETTINGS.MODAL_DISPLAY_MODE ===    'inject-rank-list' ? 'selected' : ''}>替换排行榜显示</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ==================== Tab 2: 性能与延迟 ==================== -->
            <div id="tab-perf" class="tab-content">
                <div class="qmx-settings-grid">
                    ${createUnitInput('setting-initial-script-delay',      '脚本初始启动延迟', settingsMeta)}
                    ${createUnitInput('setting-auto-pause-delay',          '领取后暂停延迟', settingsMeta)}
                    ${createUnitInput('setting-unresponsive-timeout',      '工作页失联超时', settingsMeta)}
                    ${createUnitInput('setting-red-envelope-timeout',      '红包活动加载超时', settingsMeta)}
                    ${createUnitInput('setting-popup-wait-timeout',        '红包弹窗等待超时', settingsMeta)}
                    ${createUnitInput('setting-worker-loading-timeout',    '播放器加载超时', settingsMeta)}
                    ${createUnitInput('setting-close-tab-delay',           '关闭标签页延迟', settingsMeta)}
                    ${createUnitInput('setting-switching-cleanup-timeout', '切换中状态兜底超时', settingsMeta)}
                    ${createUnitInput('setting-healthcheck-interval',      '哨兵健康检查间隔', settingsMeta)}
                    ${createUnitInput('setting-disconnected-grace-period', '断开连接清理延迟', settingsMeta)}
                    ${createUnitInput('setting-api-retry-delay',           'API重试延迟', settingsMeta)}
                    
                    <div class="qmx-settings-item" style="grid-column: 1 / -1;">
                        <label>模拟操作延迟范围 (秒) <span class="qmx-tooltip-icon" data-tooltip-key="range-delay">?</span></label>
                        <div class="qmx-range-slider-wrapper">
                            <div class="qmx-range-slider-container">
                                <div class="qmx-range-slider-track-container"><div class="qmx-range-slider-progress"></div></div>
                                <input type="range" id="setting-min-delay" min="0.1" max="5" step="0.1" value="${SETTINGS.MIN_DELAY / 1000}">
                                <input type="range" id="setting-max-delay" min="0.1" max="5" step="0.1" value="${SETTINGS.MAX_DELAY / 1000}">
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
                        <input type="number" id="setting-max-tabs" value="${SETTINGS.MAX_WORKER_TABS}">
                    </div>
                    <div class="qmx-settings-item">
                        <label for="setting-api-fetch-count">单次API获取房间数 <span class="qmx-tooltip-icon" data-tooltip-key="api-room-fetch-count">?</span></label>
                        <input type="number" id="setting-api-fetch-count" value="${SETTINGS.API_ROOM_FETCH_COUNT}">
                    </div>
                    <div class="qmx-settings-item">
                        <label for="setting-api-retry-count">API请求重试次数 <span class="qmx-tooltip-icon" data-tooltip-key="api-retry-count">?</span></label>
                        <input type="number" id="setting-api-retry-count" value="${SETTINGS.API_RETRY_COUNT}">
                    </div>

                    

                    <!-- 新增：添加两个空的占位符，使网格平衡为 2x3 -->
                    <div class="qmx-settings-item"></div>
                    <div class="qmx-settings-item"></div>
                </div>
            </div>

            <!-- ==================== Tab 4: 关于 ==================== -->
            <div id="tab-about" class="tab-content">
                <h4>关于脚本 <span class="version-tag">v2.0.6</span></h4>
                <h4>致谢</h4>
                <li>本脚本基于<a href="https://greasyfork.org/zh-CN/users/1453821-ysl-ovo" target="_blank" rel="noopener noreferrer">ysl-ovo</a>的插件<a href="https://greasyfork.org/zh-CN/scripts/532514-%E6%96%97%E9%B1%BC%E5%85%A8%E6%B0%91%E6%98%9F%E6%8E%A8%E8%8D%90%E8%87%AA%E5%8A%A8%E9%A2%86%E5%8F%96" target="_blank" rel="noopener noreferrer">《斗鱼全民星推荐自动领取》</a>
                    进行一些功能改进(也许)与界面美化，同样遵循MIT许可证开源。感谢原作者的分享</li>
                <li>v2.0.5更新中的“兼容斗鱼新版UI”功能由<a href="https://github.com/Truthss" target="_blank" rel="noopener noreferrer">@Truthss</a> 在 <a href="https://github.com/ienone/douyu-qmx-pro/pull/5" target="_blank" rel="noopener noreferrer">#5</a> 中贡献，非常感谢！</li>
                <h4>一些tips</h4>
                <ul>
                    <li>每天大概1000左右金币到上限</li>
                    <li>注意这个活动到晚上的时候，100/50/20星光棒的选项可能空了(奖池对应项会变灰)这时候攒金币过了12点再抽，比较有性价比</li>
                    <li>后台标签页有时会在还剩几秒时卡死在红包弹窗界面(标签页倒计时不动了)，然后就死循环了。这是已知bug但暂未定位到问题，请手动刷新界面</li>
                    <li>脚本还是bug不少，随缘修了＞︿＜</li>
                    <li>读取奖励内容文本需要用api实现，暂时搁置</li>
                </ul>
                <h4>脚本更新日志 (v2.0.6)</h4>
                <ul>
                    <li><b>【修复】增强脚本健壮性与兼容性</b>
                        <ul>
                            <li>修复了非东八区(UTC+8)用户每日上限重置时间不正确的问题，现在脚本会以北京时间为准进行判断。</li>
                            <li>修复了刷新(F5)工作标签页后，该页面会因身份验证失败而“死亡”的问题。现在刷新后脚本可以正常恢复工作。</li>
                        </ul>
                    </li>
                    <li><b>【优化】核心计时与监控逻辑，标识后台UI节流</b>
                        <ul>
                            <li>引入新的<code>[UI节流]</code>状态。它表示后台标签页的UI显示可能没有更新，但脚本的计时器依然正常确。<strong>这个状态不影响抢包</strong>。如需恢复UI显示，仅需切换到对应直播间一下即可</li>
                            <li>此状态的检测频率可在“设置”->“性能与延迟”中修改。</li>
                        </ul>
                    </li>
                    <li><b>【说明】关于部分标签页无法自动关闭的问题</b>
                        <ul>
                            <li>部分工作标签页在任务结束后可能无法关闭，而是跳转到空白页。我推测这是出现在由新版UI切换旧版UI的直播间中：因为切换旧版过程中斗鱼的页面跳转逻辑导致脚本关闭此工作标签页是不被允许的行为。</li>
                            <li>脚本采用跳转到<code>空白页面</code>作为备用方案，这能有效停止页面的所有活动并释放资源。<strong>请注意，这个问题是按猜测修复的，我未能实际测试能否正常实现</strong></li>
                        </ul>
                    </li>
                    <li><b>【说明】关于[已断联] 状态的说明</b>
                        <ul>
                            <li>手动关闭或刷新工作标签页后，控制面板可能会短暂显示 [已断联] 状态，这是正常的缓冲过程，用于防止刷新时任务丢失。该状态会在宽限期后自动清除。</li>
                            <li>此宽限时间可在“设置”->“性能与延迟”中修改。</li>
                        </ul>
                    </li>
                </ul>
                <h4>源码与社区</h4>
                <ul>
                    <li>可以在 <a href="https://github.com/ienone/eilatam" target="_blank" rel="noopener noreferrer">GitHub</a> 查看本脚本源码</li>
                    <li>发现BUG或有功能建议，欢迎提交 <a href="https://github.com/ienone/eilatam/issues" target="_blank" rel="noopener noreferrer">Issue</a>（不过大概率不会修……）</li>
                    <li>如果你有能力进行改进，非常欢迎提交 <a href="https://github.com/ienone/eilatam/pulls" target="_blank" rel="noopener noreferrer">Pull Request</a>！</li>
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