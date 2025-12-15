# points Specification

## Purpose
TBD - created by archiving change integrate-supabase-backend. Update Purpose after archive.
## Requirements
### Requirement: Points Management
系统 SHALL 支持积分的管理，包括获取、增加和扣除积分。

#### Scenario: 获取用户积分
- **Given**: 用户已登录
- **When**: 调用 `getUserPoints(userId)`
- **Then**:
  - 从 `user_progress` 表查询用户的积分信息
  - 返回 total_points 和 used_points
  - 计算可用积分（total_points - used_points）

#### Scenario: 增加积分
- **Given**: 用户完成练习或达成成就
- **When**: 调用 `addPoints(userId, amount, reason)`
- **Then**:
  - 更新 `user_progress` 表中的 total_points
  - 在 `points_transactions` 表中插入交易记录
  - 记录增加原因和金额
  - 返回更新后的积分

#### Scenario: 扣除积分
- **Given**: 用户兑换礼物
- **When**: 调用 `deductPoints(userId, amount, reason)`
- **Then**:
  - 验证用户有足够积分
  - 更新 `user_progress` 表中的 used_points
  - 在 `points_transactions` 表中插入交易记录
  - 记录扣除原因和金额
  - 返回更新后的积分

### Requirement: Points History
系统 SHALL 支持积分历史记录的查询。

#### Scenario: 获取积分历史
- **Given**: 用户已登录
- **When**: 调用 `getPointsHistory(userId, options)`
- **Then**:
  - 从 `points_transactions` 表查询用户的积分交易记录
  - 支持分页和排序（默认按时间降序）
  - 返回交易记录数组

