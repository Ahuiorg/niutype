# Change: 修复打字练习显示错位并改进空格输入

## Why

1. **显示错位问题**：当用户输入错误时，上方待输入行和下方已输入行出现位置错位，因为 `currentIndex` 只在正确输入时才移动。用户希望无论输入对错，两行都同步前进，这样既能看到输入错了什么，也能保持上下对齐。

2. **空格输入优化**：目前每5个字母后面的空格是自动显示的分隔符，不需要用户输入。用户希望把空格也当做一个字符来练习，需要按空格键才能继续。

## What Changes

### 1. 显示同步修复
- 修改 `exercise.ts`：无论输入正确还是错误，`currentIndex` 都增加
- 错误输入仍然记录为错误（用于统计），但允许继续前进
- 键盘上仍显示红色错误反馈

### 2. 空格输入改进
- 修改 `exerciseGenerator.ts`：在每5个字符后插入空格字符到练习内容中
- 修改 `TypingDisplay.vue`：移除自动添加空格的逻辑，因为空格已是练习内容的一部分
- 修改 `ExercisePage.vue`：空格键不再用于暂停/继续，而是作为输入字符
- 修改 `exercise.ts`：接受空格作为有效输入
- 添加新的暂停/继续快捷键（如 Escape 键）

## Impact

- Affected specs: typing-exercise
- Affected code:
  - `src/stores/exercise.ts`
  - `src/views/ExercisePage.vue`
  - `src/utils/exerciseGenerator.ts`
  - `src/components/exercise/TypingDisplay.vue`
