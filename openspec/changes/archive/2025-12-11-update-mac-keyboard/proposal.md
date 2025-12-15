# Change: 完善 Mac 风格键盘布局

## Why
当前键盘布局不完整：
1. 缺少功能键（Tab、Caps Lock、Shift、Return、Delete）
2. 缺少空格键那一行（fn、control、option、command、Space）
3. 不像一个真实的 Mac 键盘

用户希望看到一个更完整、更真实的 Mac 键盘布局（不含 F1-F12 和方向键）。

## What Changes
1. **扩展键盘布局**
   - 数字行：添加 Delete 键
   - Tab 行：添加 Tab 键
   - Caps 行：添加 Caps Lock 和 Return 键
   - Shift 行：添加左右 Shift 键
   - 新增底行：fn、control、option、command、Space、command、option

2. **支持不同宽度的按键**
   - 普通键：1 单位宽度
   - Tab、Caps Lock、Shift 等：1.5-2 单位宽度
   - 空格键：6 单位宽度

3. **Mac 键盘风格**
   - 功能键使用灰色背景，与字母键区分
   - 添加 Mac 特有的符号图标（⌘、⌥、⌃、⇧ 等）

## Impact
- Affected specs: `keyboard-display`
- Affected code:
  - 修改: `src/components/keyboard/SimpleKeyboard.vue`
  - 修改: `src/utils/fingerMapping.ts` (添加完整的键盘行布局)
