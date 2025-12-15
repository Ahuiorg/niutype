# statistics Specification

## Purpose
TBD - created by archiving change add-typing-practice-app. Update Purpose after archive.
## Requirements
### Requirement: 字母统计
系统 SHALL 记录每个字母的练习统计数据。

#### Scenario: 记录每次输入
- **WHEN** 用户输入一个字符
- **THEN** 记录该字符的尝试次数
- **AND** 记录是否正确
- **AND** 记录反应时间（从显示到按键的时间）

#### Scenario: 计算准确率
- **WHEN** 用户查看统计页面
- **THEN** 显示每个字母的准确率
- **AND** 准确率 = 正确次数 / 总尝试次数 × 100%

#### Scenario: 识别弱项字母
- **WHEN** 某字母准确率低于80%
- **THEN** 标记为弱项字母
- **AND** 在统计页面用红色高亮显示

### Requirement: 每日统计摘要
系统 SHALL 在每日练习结束后显示统计摘要。

#### Scenario: 显示今日统计
- **WHEN** 用户完成每日练习
- **THEN** 显示今日练习字符总数
- **AND** 显示今日准确率
- **AND** 显示今日平均反应时间
- **AND** 显示今日获得积分
- **AND** 显示解锁的成就（如有）

#### Scenario: 与历史对比
- **WHEN** 用户查看今日统计
- **THEN** 显示与昨日的对比（准确率提升/下降）
- **AND** 显示与历史最佳的对比

### Requirement: 可视化图表
系统 SHALL 提供直观的统计图表。

#### Scenario: 字母热力图
- **WHEN** 用户查看统计页面
- **THEN** 在键盘布局上显示热力图
- **AND** 颜色深浅表示准确率高低
- **AND** 绿色为高准确率，红色为低准确率

#### Scenario: 进度趋势图
- **WHEN** 用户查看统计页面
- **THEN** 显示最近7天/30天的准确率趋势折线图
- **AND** 显示每日练习字符数柱状图

### Requirement: 手指统计
系统 SHALL 按手指维度统计表现。

#### Scenario: 显示手指准确率
- **WHEN** 用户查看统计页面
- **THEN** 显示每个手指负责键位的综合准确率
- **AND** 识别最弱的手指并给出练习建议

