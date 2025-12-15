# 实现任务清单

## 1. 重构键盘组件
- [x] 1.1 创建新的 SimpleKeyboard.vue 组件（使用 CSS Flexbox 布局）
- [x] 1.2 实现键位渲染（按行排列，支持不同行偏移）
- [x] 1.3 实现手指颜色区分（边框颜色）
- [x] 1.4 实现目标键高亮效果（背景填充 + 发光）
- [x] 1.5 实现按键动画效果（按下反馈）

## 2. 优化底部手部指示器
- [x] 2.1 增大手指指示圆点尺寸
- [x] 2.2 增强目标手指的闪烁效果

## 3. 集成与清理
- [x] 3.1 更新 ExercisePage.vue 引用（替换 CanvasKeyboard 为 SimpleKeyboard）
- [x] 3.2 删除旧的 CanvasKeyboard.vue
- [x] 3.3 从 package.json 移除 konva 和 vue-konva 依赖
- [x] 3.4 运行 pnpm install 更新依赖
- [x] 3.5 验证所有功能正常
