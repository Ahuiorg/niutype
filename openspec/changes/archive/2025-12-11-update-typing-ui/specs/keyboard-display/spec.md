## MODIFIED Requirements

### Requirement: 虚拟键盘显示
系统 SHALL 使用 Canvas (Konva.js) 在练习界面显示完整虚拟键盘和手指，提供流畅的动画反馈。

#### Scenario: 显示键盘布局
- **WHEN** 用户进入练习页面
- **THEN** 使用 Canvas 绘制完整键盘（数字行 + 三行字母）
- **AND** 每个按键显示对应字符（字母、数字、符号）
- **AND** 按键使用不同颜色区分手指分配

#### Scenario: 高亮当前目标键
- **WHEN** 系统显示待输入字符
- **THEN** Canvas 键盘上对应的按键被高亮显示
- **AND** 高亮效果包含发光/边框动画

#### Scenario: 按键按下反馈
- **WHEN** 用户按下物理键盘上的按键
- **THEN** Canvas 键盘上对应按键显示按下动画（向下移动+变暗）
- **AND** 正确时显示绿色反馈
- **AND** 错误时显示红色反馈

### Requirement: 手指位置指示
系统 SHALL 在 Canvas 键盘上方显示10个手指，并提供按下动画。

#### Scenario: 显示手指
- **WHEN** 用户查看键盘
- **THEN** 在键盘上方显示10个手指（左手5指 + 右手5指）
- **AND** 手指颜色与对应按键颜色一致
- **AND** 手指默认位置在 Home Row (ASDF JKL) 上方

#### Scenario: 手指按下动画
- **WHEN** 用户按下某个键
- **THEN** 对应手指显示按下动画（向下移动 + 轻微压缩）
- **AND** 按键释放后手指恢复原位

## ADDED Requirements

### Requirement: 双行字母显示
系统 SHALL 提供双行字母显示区域，展示待输入和已输入内容。

#### Scenario: 显示待输入字母
- **WHEN** 用户进入练习
- **THEN** 上行显示30个待输入字母
- **AND** 每5个字母用空格分隔
- **AND** 当前目标字母有高亮标识

#### Scenario: 显示已输入字母
- **WHEN** 用户输入字符
- **THEN** 下行显示已输入内容
- **AND** 未输入位置显示深色占位符
- **AND** 正确输入显示深色字母
- **AND** 错误输入显示红色字母
- **AND** 不支持退格删除

