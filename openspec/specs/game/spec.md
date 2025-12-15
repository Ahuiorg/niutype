# game Specification

## Purpose
TBD - created by archiving change integrate-supabase-backend. Update Purpose after archive.
## Requirements
### Requirement: Game Records Management
系统 SHALL 支持游戏记录的管理，包括保存和查询游戏记录，并记录当日累计游戏时长（用于时长扣减）。

#### Scenario: 保存游戏记录
- **Given**: 用户玩游戏
- **When**: 游戏时间更新或游戏结束
- **Then**:
  - 更新 `game_records` 表中的记录
  - 使用 UPSERT 操作（基于 user_id, game_type 和 date）
  - 更新 total_time_ms（当日该游戏累计时长）和 completed 字段
  - 返回保存的记录

#### Scenario: 获取游戏记录
- **Given**: 用户已登录
- **When**: 进入游戏页面
- **Then**:
  - 从 `game_records` 表查询当日的游戏记录
  - 如果不存在，返回 null
  - 更新本地 Store 的 gameTimeTracking

#### Scenario: 获取游戏记录列表
- **Given**: 用户已登录
- **When**: 调用 `getGameRecords(userId, options)`
- **Then**:
  - 从 `game_records` 表查询记录
  - 支持按游戏类型、日期范围筛选
  - 返回记录数组

### Requirement: Game Catalog & Access Control
系统 SHALL 管理游戏列表并根据用户等级/会员进行访问控制。

#### Scenario: 获取可用游戏列表
- **Given**: 用户已登录
- **When**: 调用 `getAvailableGames(userId)`
- **Then**:
  - 查询 `game_types` 表中过滤 `is_active = true`
  - 基于用户 `membership_tier`、`level` 过滤可访问游戏
  - 返回按 `sort_order` 排序的可用游戏列表

#### Scenario: 新增/下架游戏（后台/管理）
- **Given**: 管理员或系统配置
- **When**: 新增或更新游戏定义
- **Then**:
  - 在 `game_types` 表中插入或更新记录
  - 可配置 `required_membership`（free/premium）、`required_level`
  - 可通过 `is_active` 控制上线/下线

#### Scenario: 访问受限的游戏
- **Given**: 用户已登录
- **When**: 用户尝试进入需要更高等级或会员的游戏
- **Then**:
  - 校验失败时返回明确提示（如“需要等级 X”或“需开通会员”）
  - 阻止进入游戏

### Requirement: Daily Play Eligibility & Time Quota
系统 SHALL 约束每日游戏资格与时长：完成当日练习后才能玩；每次最多 30 分钟；练习↔游戏时间比例可由家长配置（默认练 30 分→玩 30 分）；家长与会员无限制。

#### Scenario: 完成当日练习后解锁游戏
- **Given**: 用户已登录且为学生/普通用户
- **When**: 当日练习已完成（满足每日练习标准）
- **Then**:
  - 允许开始游戏，初始可用时长 30 分钟

#### Scenario: 未完成当日练习禁止游戏
- **Given**: 用户已登录且为学生/普通用户
- **When**: 当日练习未完成
- **Then**:
  - 阻止开始游戏
  - 提示“完成今日练习后可玩 30 分钟”

#### Scenario: 每次游戏时长上限 30 分钟
- **Given**: 用户已获得可用游戏时长
- **When**: 开始一局游戏
- **Then**:
  - 单次游戏时长上限 30 分钟
  - 超过 30 分钟自动结束或提示续玩需重新练习

#### Scenario: 练习换取额外游戏时长（可配置比例）
- **Given**: 用户已用完可用游戏时长
- **When**: 用户额外完成练习
- **Then**:
  - 按家长配置的比例“练 X 分 → 玩 Y 分”换算；若无配置则默认 30→30
  - 累计解锁可用时长，单次会话上限仍为 30 分钟

#### Scenario: 家长与会员无限制
- **Given**: 用户为家长角色或会员用户
- **When**: 进入游戏
- **Then**:
  - 不受练习前置与 30 分钟限制（可无限游戏）

#### Scenario: 可用时长计算
- **Given**: 用户为学生/普通用户
- **When**: 查询可用游戏时长
- **Then**:
  - 若有家长配置则使用 `practice_per_slot_minutes` / `play_per_slot_minutes`，否则默认 30→30
  - 从当日练习时长累计换算可玩时长
  - 扣减已用游戏时长（`game_records.total_time_ms` 当日累计）
  - 单次会话上限 30 分钟；返回剩余可用分钟数，最小为 0

