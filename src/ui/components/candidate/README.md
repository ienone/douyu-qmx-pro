# 斗鱼直播间候选项助手组件

这是一个完整的候选项选择 UI 组件系统，专为斗鱼直播间设计，支持智能输入提示、键盘导航和预览功能。

## 🎯 核心功能

- **智能候选项**: 基于 IndexedDB 的本地存储，支持使用频率排序
- **键盘导航**: 支持 ←/→ 或 Tab/Shift+Tab 切换，Enter 选择，Esc 关闭
- **输入预览**: 选择后显示预览界面，支持编辑和发送
- **自动绑定**: 智能检测页面输入框并自动绑定
- **主题适配**: 完美适配项目的 Material Design 主题系统
- **响应式设计**: 支持各种屏幕尺寸

## 📁 文件结构

```
src/ui/components/candidate/
├── candidateType.js      # 类型定义和工具函数
├── candidateDB.js        # IndexedDB 数据存储
├── candidatePanelState.js # 状态管理和键盘事件
├── candidateItem.js      # 单个候选项组件
├── candidatePanel.js     # 主弹窗组件
├── inputPreview.js       # 预览组件
├── inputInteraction.js   # 输入框交互逻辑
├── index.js             # 入口文件和便利导出
└── README.md           # 说明文档
```

```
src/styles/
└── candidatePanel.css   # 完整样式定义
```

## 🚀 快速开始

### 1. 基础用法

```javascript
import { setupDouyuCandidateSystem } from './ui/components/candidate/index.js';

// 初始化候选项系统
const result = await setupDouyuCandidateSystem({
    enableCommonReplies: true,  // 启用常用回复
    enableGiftResponses: true,  // 启用打赏回复
    enableInteractive: true,    // 启用互动回复
    enableGaming: false,        // 游戏相关回复
    customCandidates: ['自定义回复1', '自定义回复2']
});

if (result.success) {
    console.log('候选项系统初始化成功！');
}
```

### 2. 手动绑定输入框

```javascript
import { bindInputEvents } from './ui/components/candidate/index.js';

// 绑定特定输入框
const chatInput = document.querySelector('.chat-input');
bindInputEvents(chatInput, {
    triggerOnFocus: true,
    triggerOnInput: true,
    minLength: 0,
    debounceDelay: 200,
    customSender: async (text, inputEl) => {
        // 自定义发送逻辑
        console.log('发送消息:', text);
    }
});
```

### 3. 自动检测和绑定

```javascript
import { autoBindInputElements } from './ui/components/candidate/index.js';

// 页面加载完成后自动绑定所有合适的输入框
document.addEventListener('DOMContentLoaded', async () => {
    const boundCount = await autoBindInputElements({
        selectors: [
            'input[type="text"]',
            'textarea',
            '.chat-input'
        ]
    });
    console.log(`自动绑定了 ${boundCount} 个输入框`);
});
```

## 🎮 用户交互说明

### 键盘导航
- **←/→ 方向键**: 在候选项间切换
- **Tab/Shift+Tab**: 在候选项间切换（支持反向）
- **Enter**: 选择当前高亮的候选项
- **Esc**: 关闭候选项面板

### 鼠标操作
- **悬停**: 自动高亮候选项
- **单击**: 选择候选项
- **双击**: 快速选择候选项

### 预览功能
- **编辑按钮**: 编辑选中的内容
- **发送按钮**: 直接发送内容
- **关闭按钮**: 取消预览
- **Ctrl+Enter**: 快捷发送
- **Esc**: 关闭预览

## 🎨 样式集成

系统完全集成了项目的设计语言：

```css
/* 已包含在 candidatePanel.css 中 */
- Material Design 3 色彩系统
- 响应式布局
- 暗色主题支持
- 动画和过渡效果
- 无障碍访问支持
```

### 在项目中引入样式

在主 CSS 文件中导入：

```css
@import './candidatePanel.css';
```

或在 JavaScript 中动态加载：

```javascript
// 在 main.js 或相关模块中
import './styles/candidatePanel.css';
```

## 📊 数据管理

### 添加候选项

```javascript
import { addCandidate } from './ui/components/candidate/index.js';

await addCandidate('新的候选项文本');
```

### 获取所有候选项

```javascript
import { getCandidates } from './ui/components/candidate/index.js';

const candidates = await getCandidates();
console.log('当前候选项:', candidates);
```

### 删除候选项

```javascript
import { removeCandidate } from './ui/components/candidate/index.js';

await removeCandidate(candidateId);
```

## 🔧 高级配置

### 自定义数据库配置

```javascript
import candidateDB from './ui/components/candidate/candidateDB.js';

// 手动初始化数据库
await candidateDB.init();

// 批量操作
await candidateDB.clearAll(); // 清空所有候选项
```

### 自定义状态管理

```javascript
import candidatePanelState from './ui/components/candidate/candidatePanelState.js';

// 监听状态变化
candidatePanelState.on('onStateChange', (state) => {
    console.log('状态变化:', state);
});

// 监听候选项选择
candidatePanelState.on('onCandidateSelect', (candidate) => {
    console.log('选择了候选项:', candidate);
});
```

## 🛠️ 在现有项目中集成

### 1. 在 WorkerPage 或 ControlPage 中集成

```javascript
// 在 src/modules/WorkerPage.js 中
import { setupDouyuCandidateSystem } from '../ui/components/candidate/index.js';

class WorkerPage {
    static async init() {
        // 现有初始化逻辑...
        
        // 初始化候选项系统
        try {
            await setupDouyuCandidateSystem({
                enableCommonReplies: true,
                enableGiftResponses: true,
                enableInteractive: true
            });
            console.log('候选项系统已启用');
        } catch (error) {
            console.error('候选项系统初始化失败:', error);
        }
    }
}
```

### 2. 在设置面板中添加控制选项

```javascript
// 在设置面板中添加候选项相关设置
const candidateSettings = `
    <div class="qmx-settings-section">
        <h4>候选项助手</h4>
        <div class="qmx-settings-item">
            <label>
                <input type="checkbox" id="enable-candidate-system" checked>
                启用候选项助手
            </label>
        </div>
        <div class="qmx-settings-item">
            <button id="manage-candidates" class="qmx-modal-btn">管理候选项</button>
        </div>
    </div>
`;
```

## 🔍 调试和测试

### 开发者工具

在浏览器控制台中：

```javascript
// 查看当前状态
window.candidateDebug = {
    getState: () => candidatePanelState.getPanelState(),
    getCandidates: () => candidateDB.getCandidates(),
    clearAll: () => candidateDB.clearAll()
};
```

### 日志输出

组件系统包含详细的日志输出，可以在控制台中查看：

```
CandidateDB: 数据库连接成功
InputCandidateManager: 初始化完成
CandidateSystem: 自动绑定了 3 个输入框
```

## 🚨 注意事项

1. **IndexedDB 支持**: 需要现代浏览器支持 IndexedDB
2. **样式冲突**: 确保 CSS 类名不与现有样式冲突
3. **内存管理**: 页面卸载时会自动清理事件监听器
4. **性能优化**: 大量候选项时会自动分页显示

## 📝 许可证

与主项目相同的 MIT 许可证。