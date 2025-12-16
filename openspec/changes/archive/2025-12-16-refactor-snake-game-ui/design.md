# Design: 贪吃蛇游戏重构设计文档

## Context
当前贪吃蛇游戏是一个教育类打字练习应用的组成部分，目标用户为 7 岁儿童。现有实现采用复古像素风格，与应用整体的糖果色儿童风格不一致。

### 现有问题分析
1. **蛇身字母 Bug**：`snakeGame.ts` 第 197-200 行，移动时新头部复制了原头部字母（`letter: head.letter`），导致所有节段字母变成相同
2. **风格不一致**：深蓝背景、像素字体与主应用的糖果色、圆润风格不匹配
3. **移动端体验差**：固定 700x700px 画布在手机上显示不佳

## Goals
- 统一视觉风格，与应用其他页面保持一致
- 修复蛇身字母显示 bug
- 增强教育价值，通过单词学习模式帮助儿童学习英语单词
- 优化移动端体验

## Non-Goals
- 不改变核心游戏玩法（碰撞检测、速度递增等）
- 不增加多人模式
- 不增加排行榜功能

## Decisions

### 1. 蛇身字母逻辑修复
**决定**：修改移动逻辑，每个节段保持自己的字母不变

```typescript
// 修复后：移动时保持每个节段的原有字母
newSnake.unshift({
  x: newHeadX,
  y: newHeadY,
  letter: '' // 蛇头不显示字母，使用图标
})
// 其他节段的 letter 保持不变
```

### 2. 蛇头设计
**决定**：使用可爱的蛇头 emoji 或 SVG 图标
- 主选方案：使用 🐍 表情或自定义 SVG 绘制可爱蛇头
- 蛇头应该有方向感（根据移动方向旋转）

### 3. UI 风格
**决定**：遵循 `ui-design` spec 的糖果色设计系统
- 背景：柔和渐变（粉白-蓝白-橙白）
- 蛇身颜色：使用糖果色渐变（粉→橙→黄→绿→蓝→紫）
- 字体：Fredoka 用于游戏文字
- 卡片/按钮：大圆角、柔和阴影

### 4. 单词库机制
**决定**：采用队列模式依次出现单词字母

**单词库文件**：`src/assets/wordList.json`
- 包含 100 个简单常用的英语单词
- 动态 import 加载，便于后续扩展

```typescript
// 单词库 JSON 格式
interface WordListData {
  words: string[]  // 100 个单词
}

// 游戏状态中的单词队列
interface WordQueue {
  words: string[]           // 单词库（从 JSON 加载）
  currentWordIndex: number  // 当前单词索引
  currentLetterIndex: number // 当前字母索引
}

// 动态加载示例
const wordData = await import('@/assets/wordList.json')
const words = wordData.words
```

食物生成逻辑：
1. 从单词库依次取字母作为食物
2. 单词结束时，下一个食物显示为果子 🍎（表示空格）
3. 蛇身显示：`[🐍头]HELLO🍎WORLD🍎...`
4. 所有单词用完后循环从第一个开始

### 5. 响应式画布
**决定**：使用动态计算的画布大小

```typescript
// 根据屏幕尺寸动态计算
const gridSize = computed(() => {
  const maxWidth = Math.min(window.innerWidth - 40, 600)
  const maxHeight = Math.min(window.innerHeight - 200, 600)
  const size = Math.min(maxWidth, maxHeight)
  return Math.floor(size / gridCount)
})
```

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| 单词库未提供 | 先使用占位数据，设计好接口便于后续替换 |
| 移动端性能 | 减少画布重绘频率，使用 requestAnimationFrame |
| 字母可读性 | 增大字体、使用高对比度颜色 |

### 6. 可爱图标系统
**决定**：创建统一的 SVG 图标组件替换 emoji

```typescript
// 使用方式
<CuteIcons name="home" :size="24" />

// 支持的图标
type IconName = 
  | 'home'      // 首页 - 粉橙渐变小房子
  | 'keyboard'  // 练习 - 蓝紫渐变键盘
  | 'stats'     // 统计 - 彩色柱状图
  | 'trophy'    // 成就 - 金色奖杯
  | 'gift'      // 礼物 - 粉色礼盒
  | 'game'      // 游戏 - 紫蓝手柄
  | 'clock'     // 时间 - 绿蓝时钟
  | 'star'      // 积分 - 金色星星
  | 'fire'      // 连续 - 粉橙火焰
  | 'target'    // 准确率 - 粉色靶心
  | 'document'  // 字符 - 绿蓝文档
  | 'calendar'  // 日历 - 蓝紫日历
```

设计原则：
- 使用线性渐变（linearGradient）实现糖果色效果
- 添加白色高光圆点增加立体感
- 所有图标保持圆润、可爱的风格
- 支持自定义大小（size prop）

## Migration Plan
1. 无数据迁移需求（纯前端游戏，状态不持久化）
2. 实施顺序：
   - 先修复蛇身字母 bug
   - 再重构 UI 风格
   - 添加单词库功能
   - 重构游戏首页
   - 创建可爱图标系统
