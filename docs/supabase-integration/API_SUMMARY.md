# Supabase 集成 - API 接口总结

## 📋 当前提案设计的接口

### 1. 用户相关接口（User API）

| 接口方法 | 功能 | 对应表 |
|---------|------|--------|
| `getUserProfile(userId)` | 获取用户资料 | `user_profiles` |
| `updateUserProfile(userId, data)` | 更新用户资料 | `user_profiles` |
| `getUserProgress(userId)` | 获取用户进度 | `user_progress` |
| `updateUserProgress(userId, data)` | 更新用户进度 | `user_progress` |

### 2. 练习相关接口（Exercise API）

| 接口方法 | 功能 | 对应表 |
|---------|------|--------|
| `saveExerciseRecord(userId, record)` | 保存每日练习记录 | `exercise_records` |
| `getExerciseRecords(userId, options)` | 获取练习记录列表 | `exercise_records` |
| `batchUpdateLetterStats(userId, stats)` | 批量更新字母统计 | `letter_stats` |
| `getLetterStats(userId)` | 获取字母统计 | `letter_stats` |

### 3. 成就相关接口（Achievement API）

| 接口方法 | 功能 | 对应表 |
|---------|------|--------|
| `unlockAchievement(userId, achievementId)` | 解锁成就 | `achievements` |
| `getUserAchievements(userId)` | 获取用户成就列表 | `achievements` |

### 4. 游戏相关接口（Game API）

| 接口方法 | 功能 | 对应表 |
|---------|------|--------|
| `saveGameRecord(userId, gameType, record)` | 保存游戏记录 | `game_records` |
| `getGameRecord(userId, gameType, date)` | 获取游戏记录 | `game_records` |

### 5. 礼物相关接口（Gift API）

| 接口方法 | 功能 | 对应表 |
|---------|------|--------|
| `getAvailableGifts()` | 获取可用礼物列表 | `gifts` |
| `redeemGift(userId, giftId)` | 兑换礼物 | `redeemed_gifts` |
| `getRedeemedGifts(userId)` | 获取用户兑换记录 | `redeemed_gifts` |

---

## 🔍 当前数据库表结构

1. **user_profiles** - 用户资料（username, avatar_url, sound_enabled）
2. **user_progress** - 用户进度（current_day, consecutive_days, total_points）
3. **exercise_records** - 练习记录（每日练习数据）
4. **letter_stats** - 字母统计（每个字母的详细统计）
5. **achievements** - 成就记录
6. **game_records** - 游戏记录
7. **gifts** - 礼物（系统表）
8. **redeemed_gifts** - 已兑换礼物

---

## ⚠️ 缺失的功能支持

### 1. 用户角色区分（家长/学生）
**当前状态**: ❌ 不支持
- 没有角色字段
- 没有家长-学生关联关系
- 没有权限区分

### 2. 发音功能
**当前状态**: ❌ 不支持
- 没有发音设置存储
- 没有发音记录
- 没有发音资源管理

---

## 💡 建议补充的内容

### 需要新增的表

1. **用户角色和关联表**
2. **发音设置和记录表**
3. **发音资源表**（可选，如果使用云端音频）

### 需要新增的接口

1. **用户角色管理接口**
2. **发音功能接口**
3. **家长管理接口**（如果支持家长查看学生进度）
