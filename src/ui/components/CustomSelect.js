/**
 * @file CustomSelect.js
 * @description 负责激活和管理页面上所有自定义的下拉选择框组件。
 */

// 使用一个文件作用域的标志位，确保全局点击事件只被添加一次。
let isGlobalClickListenerAdded = false;

/**
 * 在指定的父元素内查找并激活所有的自定义下拉菜单。
 * @param {HTMLElement} parentElement - 要在其中搜索.qmx-select元素容器。
 */
export function activateCustomSelects(parentElement) {
    // 1. 激活每个下拉菜单实例
    parentElement.querySelectorAll('.qmx-select').forEach(wrapper => {
        const nativeSelect = wrapper.querySelector('select');
        const styledSelect = wrapper.querySelector('.qmx-select-styled');
        const optionsList = wrapper.querySelector('.qmx-select-options');

        // 初始化显示文本和选项列表
        styledSelect.textContent = nativeSelect.options[nativeSelect.selectedIndex].text;
        optionsList.innerHTML = '';
        for (const option of nativeSelect.options) {
            const optionDiv = document.createElement('div');
            optionDiv.textContent = option.text;
            optionDiv.dataset.value = option.value;
            if (option.selected) {
                optionDiv.classList.add('selected');
            }
            optionsList.appendChild(optionDiv);
        }

        // 绑定事件：点击标题区域，展开/收起选项
        styledSelect.addEventListener('click', (e) => {
            e.stopPropagation(); // 阻止事件冒泡到document，否则会立即关闭
            // 关闭页面上其他已打开的下拉菜单
            document.querySelectorAll('.qmx-select.active').forEach(el => {
                if (el !== wrapper) {
                    el.classList.remove('active');
                }
            });
            // 切换当前下拉菜单的状态
            wrapper.classList.toggle('active');
        });

        // 绑定事件：点击某个选项
        optionsList.querySelectorAll('div').forEach(optionDiv => {
            optionDiv.addEventListener('click', () => {
                // 更新显示文本
                styledSelect.textContent = optionDiv.textContent;
                // 同步更新原生<select>的值
                nativeSelect.value = optionDiv.dataset.value;
                // 更新高亮样式
                optionsList.querySelector('.selected')?.classList.remove('selected');
                optionDiv.classList.add('selected');
                // 关闭下拉菜单
                wrapper.classList.remove('active');
            });
        });
    });

    // 2. 仅在首次调用时绑定全局点击事件，用于关闭打开的下拉菜单
    if (!isGlobalClickListenerAdded) {
        document.addEventListener('click', () => {
            document.querySelectorAll('.qmx-select.active').forEach(el => {
                el.classList.remove('active');
            });
        });
        isGlobalClickListenerAdded = true; // 防止重复绑定
    }
}