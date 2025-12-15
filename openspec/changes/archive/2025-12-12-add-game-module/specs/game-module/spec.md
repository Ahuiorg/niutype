## ADDED Requirements

### Requirement: 游戏模块基础功能
系统 SHALL 提供游戏模块，允许用户每天玩30分钟游戏。

#### Scenario: 显示游戏入口
- **WHEN** 用户访问应用
- **THEN** 在导航菜单中显示"游戏"入口
- **AND** 显示剩余游戏时间

#### Scenario: 进入游戏模块
- **WHEN** 用户点击"游戏"入口
- **THEN** 显示游戏列表页面
- **AND** 显示今日剩余游戏时间
- **AND** 显示可用游戏（如贪吃蛇游戏）

#### Scenario: 游戏时间限制
- **WHEN** 用户开始游戏
- **THEN** 系统开始追踪游戏时间
- **AND** 游戏时间与打字练习时间分开计算
- **AND** 每天最多允许30分钟游戏时间

#### Scenario: 游戏时间用尽
- **WHEN** 用户今日游戏时间达到30分钟
- **THEN** 系统阻止用户继续游戏
- **AND** 显示友好提示信息
- **AND** 提示用户明天再来

#### Scenario: 游戏时间追踪
- **WHEN** 用户玩游戏时
- **THEN** 系统实时更新剩余游戏时间
- **AND** 游戏时间数据自动保存到 localStorage
- **AND** 每天自动重置游戏时间

### Requirement: 游戏时间数据持久化
系统 SHALL 将游戏时间数据保存到 localStorage，并在用户重新打开应用时恢复。

#### Scenario: 保存游戏时间
- **WHEN** 用户玩游戏时
- **THEN** 游戏时间数据自动保存到 localStorage
- **AND** 无需用户手动保存

#### Scenario: 恢复游戏时间
- **WHEN** 用户重新打开应用
- **THEN** 自动从 localStorage 读取游戏时间数据
- **AND** 恢复到上次的状态
- **AND** 如果日期变化，自动重置游戏时间

#### Scenario: 跨天重置
- **WHEN** 日期变化（新的一天）
- **THEN** 游戏时间自动重置为30分钟
- **AND** 清除前一天的游戏时间记录
