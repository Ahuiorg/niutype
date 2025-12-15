# Change: 使用 Frontend Design 原则重构 UI

## Why
当前 UI 使用了相对基础的卡片式设计和 Nunito 字体，虽然功能完整但缺乏视觉个性和儿童友好的趣味性。作为一个专为7岁儿童设计的打字练习应用，需要更加吸引人的视觉设计来保持学习兴趣。根据 frontend-design skill 的指导，需要避免"AI 通用风格"，创造独特、难忘的用户体验。

## What Changes
- **字体升级**: 替换 Nunito 为更有个性的字体组合（Baloo 2 + Quicksand），更适合儿童应用
- **配色方案优化**: 引入更丰富的渐变色和糖果色系，增强视觉层次
- **动画效果增强**: 添加更多有趣的微交互动画（弹跳、摇摆、闪烁星星等）
- **背景与纹理**: 添加动态背景元素（浮动几何图形、渐变网格等）
- **组件样式升级**: 卡片、按钮、徽章等组件增加更多视觉细节
- **键盘组件美化**: 提升键盘视觉效果，添加3D按压效果
- **页面过渡动画**: 增强页面切换的流畅度和趣味性

## Impact
- Affected specs: 新增 `ui-design` capability
- Affected code:
  - `src/assets/main.css` - 全局样式重构
  - `src/App.vue` - 添加背景动画
  - `src/views/HomePage.vue` - 首页重新设计
  - `src/views/ExercisePage.vue` - 练习页面优化
  - `src/views/AchievementsPage.vue` - 成就页面美化
  - `src/components/common/NavBar.vue` - 导航栏升级
  - `src/components/keyboard/SimpleKeyboard.vue` - 键盘组件增强
