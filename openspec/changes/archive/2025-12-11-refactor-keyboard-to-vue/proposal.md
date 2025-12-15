# Change: 重构键盘组件 - 从 SVG/Canvas 改为纯 Vue 实现

## Why
当前实现存在问题：
1. 目标键显示位置错误（跑到键盘外面）
2. SVG 坐标计算复杂，容易出 bug
3. 项目引入了 `konva` 和 `vue-konva` 依赖但实际未充分使用
4. Canvas/SVG 实现增加了不必要的复杂度

用户建议：既然已经用颜色区分了手指区域，使用普通 Vue 组件 + CSS 实现会更简单、更可靠。

## What Changes
1. **重构键盘组件**
   - 将 SVG 实现改为普通 Vue 组件
   - 使用 CSS Flexbox 布局键盘
   - 保留按手指颜色区分的功能

2. **优化底部手部指示器**
   - 增大手指指示器尺寸
   - 增强闪烁效果的可见性

3. **移除不需要的依赖**
   - 删除 `konva` 依赖
   - 删除 `vue-konva` 依赖

4. **简化代码结构**
   - 删除旧的 `CanvasKeyboard.vue`
   - 使用语义化的 HTML 结构

## Impact
- Affected specs: `keyboard-display`
- Affected code:
  - 删除: `src/components/keyboard/CanvasKeyboard.vue`
  - 新建: `src/components/keyboard/SimpleKeyboard.vue`
  - 修改: `src/views/ExercisePage.vue` (更新引用)
  - 修改: `package.json` (移除 konva 相关依赖)
