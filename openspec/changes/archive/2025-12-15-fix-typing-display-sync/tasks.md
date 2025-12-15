## 1. 练习内容生成

- [x] 1.1 修改 `exerciseGenerator.ts` 的 `generateExercise` 函数
  - 在返回结果前，每5个字符后插入一个空格字符
  - 空格字符用 ' '（空格）表示

## 2. 显示组件修改

- [x] 2.1 修改 `TypingDisplay.vue`
  - 移除 `formatWithSpaces` 和 `formatInputWithSpaces` 中自动添加空格的逻辑
  - 空格字符直接作为普通字符显示（使用 ␣ 符号）
  - 调整 `highlightIndex` 计算，不再需要考虑额外的空格偏移

## 3. 输入处理修改

- [x] 3.1 修改 `exercise.ts` 的 `handleInput` 和 `handlePracticeInput` 函数
  - 无论输入正确还是错误，都增加 `currentIndex`
  - 修改有效字符验证，接受空格作为有效输入

- [x] 3.2 修改 `ExercisePage.vue` 的 `handleKeyDown` 函数
  - 空格键不再用于暂停/继续
  - 空格键作为普通输入字符处理
  - 改用 Escape 键控制暂停/继续

## 4. 键盘显示

- [x] 4.1 确认 `SimpleKeyboard.vue` 能正确高亮空格键
  - 空格键作为目标键时显示高亮（蓝色）
  - 按下空格键时显示反馈

## 5. 验证测试

- [x] 5.1 测试正确输入场景
  - 输入正确字符，上下行同步前进
  - 已输入字符显示绿色

- [x] 5.2 测试错误输入场景
  - 输入错误字符，上下行同步前进
  - 错误字符显示红色
  - 键盘显示错误反馈

- [x] 5.3 测试空格输入
  - 到达空格位置时，需要按空格键
  - 空格键高亮显示
  - 空格输入正确/错误有相应反馈

- [x] 5.4 测试暂停/继续
  - Escape 键可暂停练习
  - 再次按 Escape 键继续练习
