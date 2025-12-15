# User Module Specification

## ADDED Requirements

### Requirement: User Profile Management
系统 SHALL 支持用户资料的管理，包括获取和更新用户资料。

#### Scenario: 获取用户资料
- **Given**: 用户已登录
- **When**: 调用 `getUserProfile(userId)`
- **Then**:
  - 从 `user_profiles` 表查询用户资料
  - 如果不存在，返回 null
  - 返回类型安全的用户资料对象

#### Scenario: 更新用户资料
- **Given**: 用户已登录
- **When**: 调用 `updateUserProfile(userId, data)`
- **Then**:
  - 更新 `user_profiles` 表中的记录
  - 使用 UPSERT 操作
  - 返回更新后的用户资料

#### Scenario: 创建用户资料
- **Given**: 用户首次注册成功（已输入账户名、昵称、邮箱、密码，并选择角色）
- **When**: 创建用户资料记录
- **Then**:
  - 在 `user_profiles` 表中插入记录
  - 使用 `auth.users.id` 作为主键
  - 设置账户名（从注册表单获取，已验证格式和唯一性）
  - 设置昵称（从注册表单获取）
  - 设置邮箱（从注册表单获取，冗余存储，用于登录和找回账号）
  - 设置角色（未选择则默认 student）
  - 如果角色为 student，生成唯一邀请码 `invite_code`
  - 设置默认值（sound_enabled = true）
  - 邮箱同时存储在 `auth.users` 表中，用于找回账号

### Requirement: User Progress Management
系统 SHALL 支持用户进度的管理，包括获取和更新用户进度。

#### Scenario: 获取用户进度
- **Given**: 用户已登录
- **When**: 调用 `getUserProgress(userId)`
- **Then**:
  - 从 `user_progress` 表查询用户进度
  - 如果不存在，创建默认记录并返回
  - 返回类型安全的进度对象

#### Scenario: 更新用户进度
- **Given**: 用户完成每日练习
- **When**: 调用 `updateUserProgress(userId, data)`
- **Then**:
  - 更新 `user_progress` 表中的记录
  - 使用 UPSERT 操作
  - 更新 current_day, consecutive_days, total_points 等字段
  - 返回更新后的进度对象

### Requirement: User Settings Management
系统 SHALL 支持用户设置的管理，包括音效、发音等设置。

#### Scenario: 更新用户设置
- **Given**: 用户已登录
- **When**: 用户在设置页面修改设置并保存
- **Then**:
  - 更新 `user_profiles` 表中的设置字段
  - 设置立即生效
  - 返回更新后的设置

### Requirement: User Membership & Level
系统 SHALL 管理用户会员等级和用户等级，并支持按进度/积分更新。

#### Scenario: 获取会员与等级信息
- **Given**: 用户已登录
- **When**: 调用 `getUserMembership(userId)`
- **Then**:
  - 返回 `membership_tier`（free/premium）、`membership_expires_at`、`level`

#### Scenario: 更新会员等级
- **Given**: 用户购买或续费会员
- **When**: 调用 `updateMembership(userId, tier, expiresAt)`
- **Then**:
  - 更新 `user_profiles.membership_tier` 和 `membership_expires_at`
  - 记录更新时间

#### Scenario: 根据积分/进度更新用户等级
- **Given**: 用户获得新的积分或完成进度
- **When**: 触发等级计算（规则：基于积分或进度的映射）
- **Then**:
  - 计算新的 `level`
  - 如果有变化，更新 `user_profiles.level`
  - 返回新的等级

#### Scenario: 会员过期处理
- **Given**: 当前时间超过 `membership_expires_at`
- **When**: 用户访问需要 premium 的资源
- **Then**:
  - 将 `membership_tier` 视为 free
  - 阻止访问 premium 游戏/资源
