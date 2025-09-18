```javascript
// SettingsPanel.js

import React from 'react';
import { SettingsManager, DanmukuDB } from 'your-import-paths';

class SettingsPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // ...existing state...
            importLogs: [],
            importResult: null,
            importError: null,
        };
    }

    // ...existing methods...

    // Add action handlers
    async handleTriggerImport() {
        const settings = await SettingsManager.getAll();
        
        try {
            this.showImportProgress();
            
            const result = await DanmukuDB.autoImportData(
                settings.autoImportMaxPages || 5,
                settings.autoImportPageSize || 50,
                settings.autoImportSortByPopularity !== false
            );
            
            this.showImportResult(result);
        } catch (error) {
            this.showImportError(error);
        }
    }

    async handleShowImportLogs() {
        const logs = await DanmukuDB.getImportLogs(10);
        this.showImportLogModal(logs);
    }

    render() {
        return (
            <div className="settings-panel">
                {/* ...existing sections... */}

                {/* Add new settings panel sections for sorting and import functionality */}

                {/* Add sorting settings section */}
                <div className="settings-section">
                    <h3>搜索设置</h3>
                    <div className="settings-item">
                        <label>搜索排序方式</label>
                        <select
                            onChange={e => this.handleSettingChange('sortBy', e.target.value)}
                            value={this.state.sortBy}
                        >
                            <option value="relevance">相关性（综合排序）</option>
                            <option value="popularity">人气值</option>
                            <option value="recent">最新时间</option>
                            <option value="usage">使用频率</option>
                        </select>
                        <p className="description">选择弹幕搜索结果的排序方式</p>
                    </div>
                </div>

                {/* Add import settings section   */}
                <div className="settings-section">
                    <h3>数据导入</h3>
                    <div className="settings-item">
                        <label>启用自动导入</label>
                        <input
                            type="checkbox"
                            checked={this.state.autoImportEnabled}
                            onChange={e => this.handleSettingChange('autoImportEnabled', e.target.checked)}
                        />
                        <p className="description">是否在启动时自动导入网络弹幕数据</p>
                    </div>
                    <div className="settings-item">
                        <label>最大导入页数</label>
                        <input
                            type="number"
                            min="1"
                            max="50"
                            value={this.state.autoImportMaxPages}
                            onChange={e => this.handleSettingChange('autoImportMaxPages', e.target.value)}
                        />
                        <p className="description">单次导入的最大页数（1-50）</p>
                    </div>
                    <div className="settings-item">
                        <label>每页数据量</label>
                        <input
                            type="number"
                            min="10"
                            max="100"
                            value={this.state.autoImportPageSize}
                            onChange={e => this.handleSettingChange('autoImportPageSize', e.target.value)}
                        />
                        <p className="description">每页导入的弹幕数量（10-100）</p>
                    </div>
                    <div className="settings-item">
                        <label>按人气排序导入</label>
                        <input
                            type="checkbox"
                            checked={this.state.autoImportSortByPopularity}
                            onChange={e => this.handleSettingChange('autoImportSortByPopularity', e.target.checked)}
                        />
                        <p className="description">导入时是否按人气排序获取最热门的弹幕</p>
                    </div>
                    <div className="settings-item">
                        <button onClick={() => this.handleTriggerImport()}>立即导入数据</button>
                        <p className="description">手动触发弹幕数据导入</p>
                    </div>
                    <div className="settings-item">
                        <button onClick={() => this.handleShowImportLogs()}>查看导入日志</button>
                        <p className="description">查看最近的数据导入记录</p>
                    </div>
                </div>

                {/* ...existing sections... */}
            </div>
        );
    }
}

export default SettingsPanel;
```