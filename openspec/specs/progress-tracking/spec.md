# progress-tracking Specification

## Purpose
TBD - created by archiving change add-typing-practice-app. Update Purpose after archive.
## Requirements
### Requirement: 每日进度追踪
系统 SHALL 追踪每天的练习进度和完成状态。

#### Scenario: 显示今日进度
- **WHEN** 用户查看首页
- **THEN** 显示今日已练习时间
- **AND** 显示今日剩余时间
- **AND** 显示进度条（已完成/30分钟）

#### Scenario: 显示历史天数
- **WHEN** 用户查看首页
- **THEN** 显示当前是第几天
- **AND** 显示连续打卡天数
- **AND** 显示总练习天数

#### Scenario: 每日记录保存
- **WHEN** 用户完成一天练习
- **THEN** 保存该日记录（日期、准确率、字符数、用时、获得积分）

### Requirement: 数据持久化
系统 SHALL 将所有用户数据保存到 localStorage。

#### Scenario: 自动保存数据
- **WHEN** 用户进行任何操作（输入字符、获得积分、解锁成就）
- **THEN** 自动将数据保存到 localStorage
- **AND** 无需用户手动保存

#### Scenario: 恢复数据
- **WHEN** 用户重新打开网站
- **THEN** 自动从 localStorage 读取数据
- **AND** 恢复到上次的状态

#### Scenario: 数据导出
- **WHEN** 用户点击"导出数据"按钮
- **THEN** 生成包含所有数据的 JSON 文件
- **AND** 下载到用户电脑

#### Scenario: 数据导入
- **WHEN** 用户选择导入数据文件
- **THEN** 读取 JSON 文件内容
- **AND** 覆盖当前数据（需确认）

### Requirement: 计时管理
系统 SHALL 精确追踪练习时间。

#### Scenario: 开始计时
- **WHEN** 用户开始练习
- **THEN** 开始30分钟倒计时
- **AND** 显示剩余时间

#### Scenario: 暂停计时
- **WHEN** 用户点击暂停或页面失去焦点
- **THEN** 暂停计时
- **AND** 显示"已暂停"状态

#### Scenario: 休息提醒
- **WHEN** 连续练习满5分钟
- **THEN** 显示休息提醒弹窗
- **AND** 建议用户休息眼睛30秒
- **AND** 用户可选择继续或休息

