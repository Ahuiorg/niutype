# Change: 简化键盘UI - 移除悬浮手指，优化手指提示

## Why
当前设计问题：
1. 悬浮在键盘上方的手指区域占用空间大，视觉上与键盘分离
2. 手指动画与实际按键位置距离远，不够直观
3. 增加了不必要的视觉复杂度

## What Changes
1. **移除悬浮手指区域**
   - 删除键盘上方的手指SVG绘制
   - 删除手掌连接线

2. **优化手指提示方式**
   - 在键盘底部显示简化的手部轮廓图
   - 当前目标键对应的手指高亮闪烁
   - 目标键本身高亮 + 发光效果即可指示

3. **简化布局**
   - 键盘区域更紧凑
   - 减少Canvas高度

## Impact
- Affected specs: `keyboard-display`
- Affected code:
  - 修改: `src/components/keyboard/CanvasKeyboard.vue` - 移除悬浮手指，简化布局


