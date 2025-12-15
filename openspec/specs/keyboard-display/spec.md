# keyboard-display Specification

## Purpose
TBD - created by archiving change add-typing-practice-app. Update Purpose after archive.
## Requirements
### Requirement: 虚拟键盘显示
系统 SHALL 显示完整的 Mac 风格虚拟键盘，包含所有主要键位（不含 F1-F12 和方向键）。

#### Scenario: 完整键盘布局
- **WHEN** 用户进入打字练习页面
- **THEN** 显示 5 行完整的键盘布局：
  - 第 1 行：` 1 2 3 4 5 6 7 8 9 0 - = ⌫
  - 第 2 行：⇥ Q W E R T Y U I O P [ ] \
  - 第 3 行：⇪ A S D F G H J K L ; ' ⏎
  - 第 4 行：⇧ Z X C V B N M , . / ⇧
  - 第 5 行：fn ⌃ ⌥ ⌘ 空格 ⌘ ⌥

#### Scenario: 功能键视觉区分
- **WHEN** 键盘显示时
- **THEN** 功能键（Tab、Caps、Shift、Return、Delete、fn、control、option、command、Space）使用灰色背景
- **AND** 字母/数字/符号键使用白色背景+手指颜色边框

#### Scenario: 不同宽度按键
- **WHEN** 键盘显示时
- **THEN** 功能键按实际比例显示不同宽度
- **AND** 空格键为最宽
- **AND** Tab、Caps Lock、Shift、Return、Delete 等为中等宽度

### Requirement: 基准键位提示
系统 SHALL 提供基准键位（Home Row）的提示。

#### Scenario: 显示基准位置
- **WHEN** 用户开始练习
- **THEN** 显示手指基准位置提示
- **AND** 左手：A S D F（食指在 F 上，有凸点）
- **AND** 右手：J K L ;（食指在 J 上，有凸点）

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

