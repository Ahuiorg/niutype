# Change: 优化练习难度递进与最低练习量

## Why
当前练习系统存在以下问题：
1. 每天练习量太少（约60-110次按键），用户一分钟内就能完成
2. 每天只练习一个手指，手指递进太慢
3. 完成当天任务后无法继续练习

## What Changes
- 设置每日最低练习量为 **300 次按键**
- 调整手指递进方案：
  - 第1天：2个手指（左右食指）
  - 第3天：4个手指
  - 第5天：6个手指
  - 第7天：8个手指
  - 第9天：全部手指
  - 每天内容包含前几天练过的所有手指
- 添加"重新练习"功能：完成当天任务后可继续练习，输入量计入总数

## Impact
- Affected specs: `typing-exercise`
- Affected code:
  - `src/utils/exerciseGenerator.ts` - 重新设计练习生成逻辑
  - `src/types/index.ts` - 更新练习配置
  - `src/stores/exercise.ts` - 添加重新练习功能
  - `src/views/ExercisePage.vue` - UI 支持重新练习

