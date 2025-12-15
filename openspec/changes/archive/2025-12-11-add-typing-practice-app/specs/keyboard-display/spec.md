## ADDED Requirements

### Requirement: 虚拟键盘显示
系统 SHALL 在练习界面显示完整的虚拟键盘，展示标准 QWERTY 布局的26个字母键。

#### Scenario: 显示键盘布局
- **WHEN** 用户进入练习页面
- **THEN** 显示三行字母键（QWERTY、ASDF、ZXCV 行）
- **AND** 每个按键显示对应字母
- **AND** 按键使用不同颜色区分手指分配

#### Scenario: 高亮当前目标键
- **WHEN** 系统显示待输入字符
- **THEN** 虚拟键盘上对应的按键被高亮显示
- **AND** 高亮颜色与该手指的颜色一致

#### Scenario: 按键按下反馈
- **WHEN** 用户按下物理键盘上的按键
- **THEN** 虚拟键盘上对应按键显示按下动画
- **AND** 正确时显示绿色闪烁
- **AND** 错误时显示红色闪烁

### Requirement: 手指位置指示
系统 SHALL 提供手指与键位对应关系的可视化指示。

#### Scenario: 显示手指分配
- **WHEN** 用户查看键盘
- **THEN** 不同手指负责的按键使用不同颜色标识
- **AND** 左手小指（QAZ）：紫色
- **AND** 左手无名指（WSX）：蓝色
- **AND** 左手中指（EDC）：青色
- **AND** 左手食指（RFVTGB）：绿色
- **AND** 右手食指（YHNUJM）：黄色
- **AND** 右手中指（IK）：橙色
- **AND** 右手无名指（OL）：红色
- **AND** 右手小指（P）：粉色

#### Scenario: 显示当前应使用的手指
- **WHEN** 显示待输入字符
- **THEN** 在键盘下方显示应该使用哪个手指
- **AND** 显示对应的手部图示（左手/右手 + 手指名称）

### Requirement: 基准键位提示
系统 SHALL 提供基准键位（Home Row）的提示。

#### Scenario: 显示基准位置
- **WHEN** 用户开始练习
- **THEN** 显示手指基准位置提示
- **AND** 左手：A S D F（食指在 F 上，有凸点）
- **AND** 右手：J K L ;（食指在 J 上，有凸点）

