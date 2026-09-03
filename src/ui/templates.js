/**
 * @file templates.js
 * @description 控制中心与设置页面模板。
 */

export const statsPanelTemplate = `
    <section class="qmx-panel-page qmx-stats-page" id="qmx-stats-page" aria-label="数据统计">
        <div class="qmx-stats-page-toolbar">
            <div class="qmx-stats-range" aria-label="统计周期">
                <button type="button" class="active" data-period="daily">7天</button>
                <button type="button" data-period="weekly">4周</button>
            </div>
            <button class="qmx-stats-refresh" type="button" title="刷新统计数据" aria-label="刷新统计数据">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.65 6.35A7.95 7.95 0 0012 4a8 8 0 107.73 10h-2.08A6 6 0 1116.22 7.78L13 11h7V4l-2.35 2.35z"/>
                </svg>
            </button>
        </div>
        <div class="qmx-stats-content" id="qmx-stats-content">
            <div class="qmx-stats-summary" id="qmx-stats-summary"></div>
            <section class="qmx-stats-section">
                <div class="qmx-stats-section-heading">
                    <div class="qmx-stats-section-title">收益趋势</div>
                    <div class="qmx-trend-legend" aria-label="图例">
                        <span data-reward="coin"><i></i>金币</span>
                        <span data-reward="starlight"><i></i>星光棒</span>
                    </div>
                </div>
                <div class="qmx-stats-trend" id="qmx-stats-trend"></div>
            </section>
            <div class="qmx-stats-log-toolbar">
                <div class="qmx-stats-range qmx-stats-log-range" aria-label="日志类型">
                    <button type="button" class="active" data-log-mode="all">日志</button>
                    <button type="button" data-log-mode="exceptions">异常日志</button>
                </div>
            </div>
            <details class="qmx-stats-diagnostics" id="qmx-stats-diagnostics" open>
                <summary>
                    <i></i>
                    <span id="qmx-stats-log-label">近期记录</span>
                    <b id="qmx-stats-diagnostic-count">0</b>
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 10 4 4 4-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </summary>
                <div class="qmx-stats-timeline" id="qmx-stats-timeline"></div>
            </details>
        </div>
    </section>
`;

export const mainPanelTemplate = (maxTasks) => `
    <div class="qmx-modal-header">
        <span id="qmx-panel-title" class="qmx-panel-title" aria-live="polite" aria-label="控制中心">
            <span data-panel-title="tasks">控制中心</span>
            <span data-panel-title="stats">数据统计</span>
        </span>
        <div class="qmx-modal-header-actions">
            <button id="qmx-page-switch-btn" class="qmx-header-icon-btn qmx-page-switch-btn" type="button" title="查看统计" aria-label="切换任务与统计页面">
                <svg class="qmx-page-icon qmx-page-icon-stats" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 10h3v9H5v-9zm5-5h3v14h-3V5zm5 8h3v6h-3v-6z" fill="currentColor"/></svg>
                <svg class="qmx-page-icon qmx-page-icon-back" viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <button id="qmx-theme-toggle-btn" class="qmx-header-icon-btn qmx-theme-toggle-btn" type="button" title="切换日夜模式" aria-label="切换日夜模式">
                <svg class="qmx-theme-icon qmx-theme-icon-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="currentColor"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                <svg class="qmx-theme-icon qmx-theme-icon-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 15.2A8 8 0 018.8 3.5 8.5 8.5 0 1020.5 15.2z" fill="currentColor"/></svg>
            </button>
            <button id="qmx-modal-settings-btn" class="qmx-header-icon-btn qmx-settings-icon-btn" type="button" title="设置" aria-label="打开设置">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.14 12.94a7.3 7.3 0 000-1.88l2.03-1.58-1.92-3.32-2.39.96a7.1 7.1 0 00-1.62-.94L14.88 3h-3.84l-.36 2.18c-.58.24-1.12.55-1.62.94l-2.39-.96-1.92 3.32 2.03 1.58a7.3 7.3 0 000 1.88l-2.03 1.58 1.92 3.32 2.39-.96c.5.39 1.04.7 1.62.94l.36 2.18h3.84l.36-2.18c.58-.24 1.12-.55 1.62-.94l2.39.96 1.92-3.32-2.03-1.58zM13 15.5a3.5 3.5 0 110-7 3.5 3.5 0 010 7z" fill="currentColor"/></svg>
            </button>
            <button id="qmx-modal-close-btn" class="qmx-modal-close-icon" title="关闭" aria-label="关闭控制中心"></button>
        </div>
    </div>
    <div class="qmx-panel-viewport">
        <div class="qmx-panel-track">
            <section class="qmx-panel-page qmx-task-page" id="qmx-task-page" aria-label="当前工作">
                <div class="qmx-task-overview">
                    <span class="qmx-overview-state" id="qmx-overview-state" data-state="idle"></span>
                    <span><strong id="qmx-active-tabs-count">0</strong> / ${maxTasks}</span>
                </div>
                <div class="qmx-modal-content">
                    <div id="qmx-tab-list"></div>
                </div>
                <div class="qmx-modal-footer">
                    <button id="qmx-modal-close-all-btn" class="qmx-modal-btn danger">停止所有</button>
                    <button id="qmx-modal-open-btn" class="qmx-modal-btn primary">启动领取任务</button>
                </div>
            </section>
            ${statsPanelTemplate}
        </div>
    </div>
`;

export const settingsPanelTemplate = (SETTINGS) => `
    <div class="qmx-settings-header">
        <div class="qmx-settings-tabs">
            <button class="tab-link active" data-tab="star">星推荐</button>
            ${__ENABLE_DANMU_PRO__ ? '<button class="tab-link" data-tab="danmupro">弹幕助手</button>' : ''}
            <button class="tab-link" data-tab="about">关于</button>
        </div>
    </div>
    <div class="qmx-settings-content">
        <div id="tab-star" class="tab-content active">
            <div class="qmx-settings-grid">
                <div class="qmx-settings-item">
                    <label for="setting-control-room-id">控制室房间号</label>
                    <input type="number" class="qmx-input" id="setting-control-room-id" value="${SETTINGS.CONTROL_ROOM_ID}">
                </div>
                <div class="qmx-settings-item">
                    <label for="setting-prewarm-duration">后台页面停留时间（秒）</label>
                    <input type="number" class="qmx-input" id="setting-prewarm-duration" min="0.5" max="15" step="0.5" value="${SETTINGS.ROOM_PREWARM_DURATION / 1000}">
                </div>
                <div class="qmx-settings-item">
                    <label>达到上限后的行为</label>
                    <div class="qmx-select" data-target-id="setting-daily-limit-action">
                        <div class="qmx-select-styled"></div>
                        <div class="qmx-select-options"></div>
                        <select id="setting-daily-limit-action" style="display:none">
                            <option value="CONTINUE_DORMANT" ${SETTINGS.DAILY_LIMIT_ACTION === 'CONTINUE_DORMANT' ? 'selected' : ''}>休眠并等待次日恢复</option>
                            <option value="STOP_ALL" ${SETTINGS.DAILY_LIMIT_ACTION === 'STOP_ALL' ? 'selected' : ''}>停止所有领取任务</option>
                        </select>
                    </div>
                </div>
                <div class="qmx-settings-item">
                    <label>控制中心显示方式</label>
                    <div class="qmx-select" data-target-id="setting-modal-mode">
                        <div class="qmx-select-styled"></div>
                        <div class="qmx-select-options"></div>
                        <select id="setting-modal-mode" style="display:none">
                            <option value="floating" ${SETTINGS.MODAL_DISPLAY_MODE === 'floating' ? 'selected' : ''}>浮动窗口</option>
                            <option value="centered" ${SETTINGS.MODAL_DISPLAY_MODE === 'centered' ? 'selected' : ''}>屏幕居中</option>
                            <option value="inject-rank-list" ${SETTINGS.MODAL_DISPLAY_MODE === 'inject-rank-list' ? 'selected' : ''}>侧栏模式</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        ${__ENABLE_DANMU_PRO__ ? `
        <div id="tab-danmupro" class="tab-content">
            <div class="qmx-settings-grid">
                <div class="qmx-settings-item">
                    <label>启用弹幕助手</label>
                    <label class="qmx-toggle">
                        <input type="checkbox" id="setting-danmupro-mode" ${SETTINGS.ENABLE_DANMU_PRO ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="qmx-settings-item">
                    <label>剧场模式增强输入栏</label>
                    <label class="qmx-toggle">
                        <input type="checkbox" id="setting-theater-composer" ${SETTINGS.ENABLE_THEATER_COMPOSER ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
            </div>
        </div>` : ''}

        <div id="tab-about" class="tab-content">
            <div class="qmx-about-identity">
                <strong>全民星推荐助手</strong>
                <span class="version-tag">v2.1.0 Beta</span>
            </div>
            <div class="qmx-about-links">
                <a href="https://github.com/ienone/douyu-qmx-pro/" target="_blank" rel="noopener noreferrer">源码</a>
                <a href="https://github.com/ienone/douyu-qmx-pro/issues" target="_blank" rel="noopener noreferrer">反馈</a>
            </div>
        </div>
    </div>
    <div class="qmx-settings-footer">
        <button id="qmx-settings-cancel-btn" class="qmx-modal-btn">取消</button>
        <button id="qmx-settings-reset-btn" class="qmx-modal-btn danger">恢复默认</button>
        <button id="qmx-settings-save-btn" class="qmx-modal-btn primary">保存</button>
    </div>
`;
