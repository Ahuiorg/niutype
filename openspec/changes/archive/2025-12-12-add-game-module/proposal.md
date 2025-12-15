# Change: 添加游戏模块

## Why
为了增加应用的趣味性和用户粘性，需要添加一个游戏模块。游戏模块可以让用户在完成打字练习后，通过游戏放松和娱乐，同时保持对应用的兴趣。第一个游戏是复古像素风格的贪吃蛇游戏，符合应用的整体设计风格。

## What Changes
- **ADDED**: 游戏模块基础功能（每天30分钟游戏时间限制）
- **ADDED**: 贪吃蛇游戏（第一个游戏）
  - 经典贪吃蛇玩法
  - 字母主题：食物是随机字母，蛇身由字母组成
  - 复古像素风格和半调图案视觉设计
  - 键盘方向键控制
  - 触摸屏支持（移动端）
  - 响应式设计
  - 游戏结束和重新开始功能

## Impact
- **Affected specs**: 
  - 新增 `game-module` 能力规范
  - 新增 `snake-game` 能力规范
- **Affected code**: 
  - 新增 `src/stores/game.ts` - 游戏状态管理
  - 新增 `src/views/GamePage.vue` - 游戏页面
  - 新增 `src/views/SnakeGamePage.vue` - 贪吃蛇游戏页面
  - 新增 `src/components/game/` - 游戏相关组件
  - 修改 `src/router.ts` - 添加游戏路由
  - 修改 `src/types/index.ts` - 添加游戏相关类型定义
  - 修改 `src/stores/user.ts` - 添加游戏时间追踪
