## MODIFIED Requirements

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
