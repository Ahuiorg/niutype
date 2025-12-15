# Gift Module Specification

## ADDED Requirements

### Requirement: Gift Management
系统 SHALL 支持礼物的管理，包括获取礼物列表和礼物详情。

#### Scenario: 获取可用礼物列表
- **Given**: 用户已登录
- **When**: 调用 `getAvailableGifts()`
- **Then**:
  - 从 `gifts` 表查询所有激活的礼物
  - 过滤 is_active = true 的记录
  - 返回礼物数组

#### Scenario: 获取礼物详情
- **Given**: 用户已登录
- **When**: 调用 `getGiftById(giftId)`
- **Then**:
  - 从 `gifts` 表查询指定礼物
  - 返回礼物详情（名称、积分、图片、描述等）

### Requirement: Gift Redemption
系统 SHALL 支持礼物兑换功能。

#### Scenario: 兑换礼物
- **Given**: 用户有足够积分
- **When**: 调用 `redeemGift(userId, giftId)`
- **Then**:
  - 验证礼物存在且可用
  - 验证用户有足够积分
  - 在 `redeemed_gifts` 表中插入记录
  - 扣除用户积分（调用积分模块）
  - 返回兑换记录

#### Scenario: 兑换失败（积分不足）
- **Given**: 用户积分不足
- **When**: 调用 `redeemGift(userId, giftId)`
- **Then**:
  - 验证失败
  - 返回错误提示
  - 不创建兑换记录

### Requirement: Redemption Records
系统 SHALL 支持兑换记录的查询。

#### Scenario: 获取用户兑换记录
- **Given**: 用户已登录
- **When**: 调用 `getRedeemedGifts(userId)`
- **Then**:
  - 从 `redeemed_gifts` 表查询用户的兑换记录
  - 关联查询 `gifts` 表获取礼物详情
  - 按兑换时间降序排列
  - 返回兑换记录数组
