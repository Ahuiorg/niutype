# achievement Specification

## Purpose
TBD - created by archiving change integrate-supabase-backend. Update Purpose after archive.
## Requirements
### Requirement: Achievement Unlocking
系统 SHALL 支持成就解锁功能。

#### Scenario: 解锁成就
- **Given**: 用户满足成就条件
- **When**: 调用 `unlockAchievement(userId, achievementId)`
- **Then**:
  - 在 `achievements` 表中插入记录
  - 使用 UPSERT 操作（基于 user_id 和 achievement_id）
  - 记录解锁时间
  - 返回成就记录

#### Scenario: 重复解锁成就（应被忽略）
- **Given**: 用户已解锁某个成就
- **When**: 再次调用 `unlockAchievement(userId, achievementId)`
- **Then**:
  - 检测到成就已存在
  - 不创建新记录
  - 返回现有成就记录

### Requirement: Achievement Query
系统 SHALL 支持成就记录的查询。

#### Scenario: 获取用户成就列表
- **Given**: 用户已登录
- **When**: 调用 `getUserAchievements(userId)`
- **Then**:
  - 从 `achievements` 表查询用户的所有成就
  - 按解锁时间降序排列
  - 返回成就数组

#### Scenario: 检查成就是否已解锁
- **Given**: 用户已登录
- **When**: 调用 `isAchievementUnlocked(userId, achievementId)`
- **Then**:
  - 从 `achievements` 表查询指定成就
  - 返回布尔值（true/false）

