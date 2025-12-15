# ui-design Specification

## Purpose
TBD - created by archiving change refactor-ui-design. Update Purpose after archive.
## Requirements
### Requirement: 字体系统
系统 SHALL 使用个性化字体组合，包含标题字体 (Baloo 2)、正文字体 (Quicksand) 和键盘显示字体 (Fredoka)，以提供适合儿童的友好视觉体验。

#### Scenario: 字体正确加载
- **GIVEN** 用户首次访问应用
- **WHEN** 页面加载完成
- **THEN** 所有文字应使用指定的自定义字体显示
- **AND** 字体加载失败时应回退到系统字体

#### Scenario: 字体层级应用
- **GIVEN** 页面包含标题和正文内容
- **WHEN** 用户查看页面
- **THEN** 标题应使用 Baloo 2 字体，圆润友好
- **AND** 正文应使用 Quicksand 字体，清晰易读

---

### Requirement: 糖果色配色系统
系统 SHALL 使用糖果乐园 (Candy Land) 风格的配色方案，包含粉色、橙色、黄色、绿色、蓝色、紫色等明亮柔和的颜色。

#### Scenario: 配色变量可用
- **GIVEN** 开发者需要应用主题色
- **WHEN** 引用 CSS 变量
- **THEN** 应能访问完整的糖果色系变量
- **AND** 颜色应在整个应用中保持一致

#### Scenario: 背景渐变显示
- **GIVEN** 用户打开任意页面
- **WHEN** 页面渲染完成
- **THEN** 背景应显示柔和的多色渐变效果
- **AND** 渐变应从粉白过渡到蓝白再到橙白

---

### Requirement: 动画与微交互
系统 SHALL 提供丰富的动画效果和微交互反馈，包括页面入场动画、按钮悬停效果、成功反馈动画等。

#### Scenario: 页面入场动画
- **GIVEN** 用户导航到新页面
- **WHEN** 页面组件渲染
- **THEN** 内容应以错落动画 (staggered reveal) 的方式依次显示
- **AND** 动画应流畅且不超过 500ms 总时长

#### Scenario: 按钮交互反馈
- **GIVEN** 页面包含可点击按钮
- **WHEN** 用户悬停在按钮上
- **THEN** 按钮应显示轻微放大和弹跳效果
- **AND** 点击时应有按压下沉效果

#### Scenario: 打字成功反馈
- **GIVEN** 用户在练习页面输入正确字符
- **WHEN** 系统确认输入正确
- **THEN** 键盘按键应显示绿色成功反馈
- **AND** 可选择显示小型庆祝动画

#### Scenario: 减弱动画偏好
- **GIVEN** 用户设备启用了 "prefers-reduced-motion" 设置
- **WHEN** 页面加载
- **THEN** 所有非必要动画应被禁用或简化
- **AND** 功能性反馈（如按键状态）应保留

---

### Requirement: 卡片组件样式
系统 SHALL 提供统一的卡片组件样式，具有大圆角、柔和阴影和悬停浮起效果。

#### Scenario: 卡片基础样式
- **GIVEN** 页面包含卡片组件
- **WHEN** 卡片渲染
- **THEN** 卡片应有 20px+ 的圆角
- **AND** 应有柔和的投影效果

#### Scenario: 卡片悬停效果
- **GIVEN** 可交互的卡片组件
- **WHEN** 用户悬停
- **THEN** 卡片应轻微上浮 (translateY: -4px)
- **AND** 阴影应扩展增强

---

### Requirement: 按钮组件样式
系统 SHALL 提供圆润的药丸形状按钮，具有渐变背景、弹性动画和微光效果。

#### Scenario: 主要按钮样式
- **GIVEN** 页面包含主要操作按钮
- **WHEN** 按钮渲染
- **THEN** 按钮应显示为药丸形状 (border-radius: 100px)
- **AND** 应有渐变背景和微光效果

#### Scenario: 按钮按压效果
- **GIVEN** 用户点击按钮
- **WHEN** 鼠标/触摸按下
- **THEN** 按钮应有弹性下沉效果
- **AND** 释放后应弹回原位

---

### Requirement: 键盘组件增强
系统 SHALL 提供增强的键盘组件样式，包含 3D 按压效果、明显的目标键高亮和清晰的手指指示。

#### Scenario: 键盘 3D 效果
- **GIVEN** 练习页面显示键盘
- **WHEN** 键盘渲染
- **THEN** 每个按键应有 3D 立体效果
- **AND** 按下时应有明显的下沉动画

#### Scenario: 目标键高亮
- **GIVEN** 系统指示用户按下特定按键
- **WHEN** 目标键被高亮
- **THEN** 目标键应有脉冲发光动画
- **AND** 对应手指指示器应同步高亮

---

### Requirement: 导航栏样式
系统 SHALL 提供与整体风格一致的导航栏设计，具有渐变背景、圆润的导航项和流畅的交互动画。

#### Scenario: 导航栏显示
- **GIVEN** 用户访问任意页面
- **WHEN** 页面加载
- **THEN** 导航栏应显示渐变背景
- **AND** 品牌名称和导航项应使用新字体

#### Scenario: 导航项交互
- **GIVEN** 导航栏包含多个导航项
- **WHEN** 用户悬停在导航项上
- **THEN** 导航项应有轻微放大效果
- **AND** 当前页面对应的导航项应有明显的激活状态

---

### Requirement: 背景装饰效果
系统 SHALL 在页面背景显示缓慢浮动的几何图形装饰，增加视觉趣味性。

#### Scenario: 背景装饰显示
- **GIVEN** 用户访问非全屏游戏页面
- **WHEN** 页面渲染
- **THEN** 背景应显示浮动的几何图形（圆形、星形等）
- **AND** 图形应以缓慢、柔和的动画移动

#### Scenario: 练习页面背景简化
- **GIVEN** 用户在练习页面
- **WHEN** 练习进行中
- **THEN** 背景装饰应被简化或隐藏
- **AND** 确保用户注意力集中在键盘和打字区域

---

### Requirement: 响应式设计保持
系统 SHALL 在所有屏幕尺寸上保持良好的视觉效果，确保新设计在移动端和桌面端都正常显示。

#### Scenario: 桌面端显示
- **GIVEN** 用户使用桌面设备访问
- **WHEN** 页面加载
- **THEN** 所有新设计元素应正确显示
- **AND** 布局应充分利用屏幕空间

#### Scenario: 平板端适配
- **GIVEN** 用户使用平板设备访问
- **WHEN** 页面加载
- **THEN** 布局应自适应屏幕宽度
- **AND** 触摸交互应正常工作

