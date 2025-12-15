# Change: 优化打字练习界面 - 双行字母显示和 Canvas 手指键盘

## Why
当前界面存在以下问题：
1. 只显示单个字母，用户无法预览接下来要输入的内容
2. 手指指示与键盘距离太远，视觉体验不连贯
3. 缺乏沉浸式的打字体验
4. 键盘只有字母，缺少数字和符号

## What Changes
1. **双行字母显示区**
   - 上行：显示30个待输入字符，每5个字符用空格分隔
   - 下行：显示已输入内容，未输入为深色占位，正确为深色，错误为红色
   - 不支持删除/退格

2. **Canvas 手指键盘** (使用 Konva.js)
   - 完整键盘布局：数字行 + 三行字母（参考Mac键盘风格）
   - 10个手指悬浮在键盘上方
   - 手指按下动画效果
   - 按键高亮和按下动画
   - 移除原有的 FingerGuide 组件

3. **练习内容扩展**
   - 第1个月：26个字母
   - 第2个月：字母 + 数字（0-9）
   - 第3个月：字母 + 数字 + 符号

## Impact
- Affected specs: `keyboard-display`, `typing-exercise`
- Affected code:
  - 删除: `src/components/keyboard/VirtualKeyboard.vue`
  - 删除: `src/components/keyboard/KeyboardKey.vue`
  - 删除: `src/components/keyboard/FingerGuide.vue`
  - 删除: `src/components/exercise/CharacterDisplay.vue`
  - 新增: `src/components/keyboard/CanvasKeyboard.vue` (Konva.js)
  - 新增: `src/components/exercise/TypingDisplay.vue`
  - 修改: `src/views/ExercisePage.vue`
  - 修改: `src/utils/exerciseGenerator.ts` - 支持数字和符号
  - 修改: `src/utils/fingerMapping.ts` - 添加数字和符号映射
  - 新增依赖: `konva`, `vue-konva`
