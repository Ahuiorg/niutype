# Exercise Module Specification

## ADDED Requirements

### Requirement: Exercise Records Management
系统 SHALL 支持练习记录的管理，包括保存和查询练习记录。

#### Scenario: 保存练习记录
- **Given**: 用户完成每日练习
- **When**: 调用 `saveExerciseRecord(userId, record)`
- **Then**:
  - 在 `exercise_records` 表中插入或更新记录
  - 使用 UPSERT 操作（基于 user_id 和 date）
  - 保存完整的练习数据（total_chars, accuracy, earned_points 等）
  - 返回保存的记录

#### Scenario: 获取练习记录列表
- **Given**: 用户已登录
- **When**: 调用 `getExerciseRecords(userId, options)`
- **Then**:
  - 从 `exercise_records` 表查询记录
  - 支持分页和排序（默认按日期降序）
  - 返回记录数组

#### Scenario: 加载历史练习记录
- **Given**: 用户登录成功
- **When**: 查看统计页面
- **Then**:
  - 从 `exercise_records` 表查询用户的所有记录
  - 按日期降序排列
  - 更新本地 Store 的 dailyRecords

### Requirement: Letter Statistics Management
系统 SHALL 支持字母统计的管理，包括批量更新和查询字母统计。

#### Scenario: 批量更新字母统计
- **Given**: 用户练习过程中
- **When**: 定期同步或练习完成时
- **Then**:
  - 批量更新 `letter_stats` 表中的记录
  - 使用 UPSERT 操作（基于 user_id 和 letter）
  - 累加统计数据（total_attempts, correct_attempts 等）
  - 返回更新结果

#### Scenario: 获取字母统计
- **Given**: 用户已登录
- **When**: 调用 `getLetterStats(userId)`
- **Then**:
  - 从 `letter_stats` 表查询用户的所有字母统计
  - 返回统计对象（Record<string, LetterStat>）
