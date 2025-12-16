# Change: 重构贪吃蛇游戏 - 儿童风格与单词学习模式

## Why
当前贪吃蛇游戏采用复古像素风格，与应用整体的儿童友好糖果色风格不一致。同时存在蛇身字母显示的 bug，以及移动端体验不佳的问题。需要将游戏改造成教育性更强的单词学习工具。

## What Changes
- **UI 风格重构**：从复古像素风格改为儿童糖果色风格，使用项目统一的字体系统 (Baloo 2, Quicksand, Fredoka) 和配色方案
- **修复蛇身字母逻辑**：修复移动时所有字母变成相同的 bug，确保吃到的字母追加到蛇身末尾并保持
- **蛇头图标化**：使用可爱的蛇头图标/表情替代字母显示
- **响应式布局优化**：优化手机端体验，支持自适应画布大小和更友好的触摸控制
- **单词库模式**：实现单词序列出现机制，依次出现单词字母，用果子 🍎 表示空格分隔，蛇身最终显示如 `[蛇头]HELLO🍎WORLD`
- **游戏首页 UI 重构**：将游戏中心页面从深蓝复古风格改为糖果色风格，增加装饰元素和动画效果
- **可爱图标系统**：创建统一的糖果色 SVG 图标组件 `CuteIcons.vue`，替换全站 emoji 图标，保持风格一致性

## Impact
- Affected specs: `snake-game`
- Affected code:
  - `src/components/game/SnakeGameCanvas.vue` - 画布渲染逻辑
  - `src/views/SnakeGamePage.vue` - 游戏页面布局与样式
  - `src/utils/snakeGame.ts` - 游戏逻辑（字母管理、单词库）
  - `src/components/game/GameControls.vue` - 触摸控制优化
  - `src/components/game/GameScore.vue` - 分数样式
  - `src/components/game/GameOverModal.vue` - 结束弹窗样式
  - `src/types/index.ts` - 可能需要新增类型定义
  - `src/views/GamePage.vue` - 游戏首页布局与样式
  - `src/components/icons/CuteIcons.vue` - 新增可爱图标组件
  - `src/components/common/NavBar.vue` - 导航栏图标更新
  - `src/views/HomePage.vue` - 首页图标更新

## Decisions
- **单词库文件**：`src/assets/wordList.json`，包含 100 个简单常用的英语单词
- **加载方式**：游戏中动态 import 该 JSON 文件
- **图标系统**：使用 SVG 渐变图标组件，支持自定义大小，包含 12 种常用图标（home, keyboard, stats, trophy, gift, game, clock, star, fire, target, document, calendar）
