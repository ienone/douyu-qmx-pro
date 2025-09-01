/**
 * @file RangeSlider.js
 * @description 负责双柄范围滑块组件的激活和管理。
 */

/**
 * 在指定的父元素内查找并激活双柄范围滑块。
 *
 * @param {HTMLElement} parentElement - 将在其中搜索滑块组件的容器元素。
 *                                    例如，设置面板的根 `div`。
 */
export function activateRangeSlider(parentElement) {

    // 1. 查找组件的根容器
    const wrapper = parentElement.querySelector('.qmx-range-slider-wrapper');

    if (!wrapper) {
        return;
    }

    // 2. 在组件容器内部查找所有必要的元素
    const minSlider = wrapper.querySelector('#setting-min-delay');
    const maxSlider = wrapper.querySelector('#setting-max-delay');
    const sliderValues = wrapper.querySelector('.qmx-range-slider-values');
    const progress = wrapper.querySelector('.qmx-range-slider-progress');

    if (!minSlider || !maxSlider || !sliderValues || !progress) {
        console.error('范围滑块组件缺少必要的子元素 (min/max slider, values, progress)。');
        return;
    }

    /**
     * 核心函数：根据当前滑块的值更新UI。
     */
    function updateSliderView() {
        // 确保最小值滑块的值不会超过最大值
        if (parseFloat(minSlider.value) > parseFloat(maxSlider.value)) {
            maxSlider.value = minSlider.value;
        }

        // a. 更新UI显示文本值
        sliderValues.textContent = `${minSlider.value} s - ${maxSlider.value} s`;

        // b. 更新UI：计算并设置进度条的 `left` 和 `width`
        const minPercent = ((minSlider.value - minSlider.min) / (minSlider.max - minSlider.min)) * 100;
        const maxPercent = ((maxSlider.value - maxSlider.min) / (maxSlider.max - minSlider.min)) * 100;

        progress.style.left = `${minPercent}%`;
        progress.style.width = `${maxPercent - minPercent}%`;
    }

    // 6. 绑定事件：当任一滑块的值发生变化时都调用 updateSliderView 函数来更新UI。
    minSlider.addEventListener('input', updateSliderView);
    maxSlider.addEventListener('input', updateSliderView);

    // 7. 初始调用
    updateSliderView();
}