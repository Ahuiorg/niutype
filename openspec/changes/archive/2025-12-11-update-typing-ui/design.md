# 技术设计文档

## Context

### 背景
优化打字练习界面，提供更直观的视觉反馈和更好的用户体验。

### 约束
- 使用 Konva.js 实现 Canvas 渲染
- 需要流畅的动画效果（60fps）
- 保持与现有数据层的兼容

## Goals / Non-Goals

### Goals
- 提供双行字母显示，用户可预览待输入内容
- 手指悬浮在键盘上方，按下时有动画效果
- 键盘按键有高亮和按下动画
- 视觉上更接近真实打字体验

### Non-Goals
- 不做3D渲染
- 不支持自定义键盘布局
- 不支持退格删除

## Decisions

### 1. 双行字母显示设计
```
上行（待输入）: RFTVG BHNJU MKIOL PQWER TYUIO PASED
下行（已输入）: RFTVG BH___ _____ _____ _____ _____
                 ↑正确  ↑当前位置（深色占位）
```
- 每行30个字符，每5个用空格分隔
- 未输入：深灰色占位符 `_`
- 正确输入：深色字母
- 错误输入：红色字母
- 当前位置：下划线或光标指示

### 2. Canvas 键盘布局（完整版）
```
┌─────────────────────────────────────────────────┐
│             10个手指悬浮区域                      │
│        (左手5指)        (右手5指)                 │
├─────────────────────────────────────────────────┤
│  `  1  2  3  4  5  6  7  8  9  0  -  =          │
│    Q  W  E  R  T  Y  U  I  O  P  [  ]  \        │
│     A  S  D  F  G  H  J  K  L  ;  '             │
│       Z  X  C  V  B  N  M  ,  .  /              │
└─────────────────────────────────────────────────┘
```

### 3. 手指设计
- 10个手指，每个手指由圆角矩形 + 指尖圆弧组成
- 颜色与对应按键颜色一致
- 默认位置：悬浮在 Home Row (ASDF JKL) 上方
- 按下动画：手指向下移动 + 对应按键按下效果

### 4. 动画效果
```typescript
// 手指按下动画
const fingerPressAnimation = {
  duration: 0.1,  // 100ms
  easing: 'easeOut',
  properties: {
    y: '+15',     // 向下移动15px
    scaleY: 0.9,  // 轻微压缩
  }
}

// 按键按下动画
const keyPressAnimation = {
  duration: 0.08,
  properties: {
    y: '+3',
    fill: 'darken',
  }
}
```

### 5. 手指与按键映射（含数字和符号）
```typescript
const FINGER_KEY_MAP = {
  // 字母
  'left-pinky': ['Q', 'A', 'Z', '`', '1'],
  'left-ring': ['W', 'S', 'X', '2'],
  'left-middle': ['E', 'D', 'C', '3'],
  'left-index': ['R', 'F', 'V', 'T', 'G', 'B', '4', '5'],
  'right-index': ['Y', 'H', 'N', 'U', 'J', 'M', '6', '7'],
  'right-middle': ['I', 'K', ',', '8'],
  'right-ring': ['O', 'L', '.', '9'],
  'right-pinky': ['P', ';', "'", '/', '0', '-', '=', '[', ']', '\\'],
}

// 手指默认 X 位置（相对于键盘宽度）
const FINGER_HOME_POSITIONS = {
  'left-pinky': { x: 0.05, homeKey: 'A' },
  'left-ring': { x: 0.12, homeKey: 'S' },
  'left-middle': { x: 0.19, homeKey: 'D' },
  'left-index': { x: 0.26, homeKey: 'F' },
  'right-index': { x: 0.52, homeKey: 'J' },
  'right-middle': { x: 0.59, homeKey: 'K' },
  'right-ring': { x: 0.66, homeKey: 'L' },
  'right-pinky': { x: 0.73, homeKey: ';' },
}
```

### 6. 练习阶段扩展
```typescript
// 第1个月（第1-30天）：字母
const MONTH1_CHARS = 'QWERTYUIOPASDFGHJKLZXCVBNM'.split('')

// 第2个月（第31-60天）：字母 + 数字
const MONTH2_CHARS = [...MONTH1_CHARS, '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

// 第3个月（第61天+）：字母 + 数字 + 符号
const MONTH3_CHARS = [...MONTH2_CHARS, 
  '`', '-', '=', '[', ']', '\\', ';', "'", ',', '.', '/'
]

function getAvailableChars(day: number): string[] {
  if (day <= 30) return MONTH1_CHARS       // 第1个月：字母
  if (day <= 60) return MONTH2_CHARS       // 第2个月：+数字
  return MONTH3_CHARS                       // 第3个月：+符号
}
```

## Component Architecture

```
src/components/
├── keyboard/
│   └── CanvasKeyboard.vue      # Konva Canvas 键盘 + 手指
├── exercise/
│   └── TypingDisplay.vue       # 双行字母显示
```

### CanvasKeyboard Props
```typescript
interface Props {
  targetKey: string        // 当前目标键
  pressedKey: string       // 当前按下的键
  pressResult: 'correct' | 'wrong' | null
}
```

### TypingDisplay Props
```typescript
interface Props {
  targetText: string[]     // 待输入的字符数组
  inputText: string[]      // 已输入的字符数组（含正确/错误标记）
  currentIndex: number     // 当前输入位置
}
```

## Risks / Trade-offs

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| Canvas 性能问题 | 动画卡顿 | 使用 Konva 内置优化，限制重绘区域 |
| 手指位置计算复杂 | 实现难度 | 预计算位置，使用相对坐标 |
| 移动端不支持 | 体验差 | 本项目仅支持桌面端，可忽略 |

