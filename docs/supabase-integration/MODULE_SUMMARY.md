# Supabase 集成 - 模块总结

## 📦 模块列表

| 模块 | 优先级 | 状态 | 数据库表数 | API 方法数 |
|------|--------|------|-----------|-----------|
| **1. 基础设施模块** | P0 | 必须 | 0 | 5 |
| **2. 用户模块** | P0 | 必须 | 2 | 4 |
| **3. 练习模块** | P0 | 必须 | 2 | 4 |
| **4. 游戏模块** | P1 | 重要 | 1 | 3 |
| **5. 积分模块** | P1 | 重要 | 1 | 4 |
| **6. 礼物模块** | P1 | 重要 | 2 | 4 |
| **7. 成就模块** | P1 | 重要 | 1 | 3 |
| **8. 家长模块** | P2 | 可选 | 1 | 8 |
| **9. 资源模块** | P2 | 可选 | 5 | 9 |

**总计**: 9 个模块，15 张表，44 个 API 方法

---

## 📋 模块详细说明

### 1. 基础设施模块 (Infrastructure)

**功能**: Supabase 配置、认证基础

**数据库表**: 无（使用 Supabase Auth 内置表）

**API 接口**:
- `initSupabaseClient()` - 初始化客户端
- `signUp(email, password)` - 用户注册
- `signIn(email, password)` - 用户登录
- `signOut()` - 用户登出
- `getSession()` - 获取会话
- `resetPassword(email)` - 重置密码

**代码位置**:
- `src/services/supabase/`
- `src/services/auth/`

---

### 2. 用户模块 (User)

**功能**: 用户资料、进度、设置管理

**数据库表**:
- `user_profiles` - 用户资料
- `user_progress` - 用户进度

**API 接口**:
- `getUserProfile(userId)` - 获取用户资料
- `updateUserProfile(userId, data)` - 更新用户资料
- `getUserProgress(userId)` - 获取用户进度
- `updateUserProgress(userId, data)` - 更新用户进度

**代码位置**:
- `src/services/api/user.api.ts`
- `src/stores/user.ts` (修改)

---

### 3. 练习模块 (Exercise)

**功能**: 练习记录、字母统计管理

**数据库表**:
- `exercise_records` - 练习记录
- `letter_stats` - 字母统计

**API 接口**:
- `saveExerciseRecord(userId, record)` - 保存练习记录
- `getExerciseRecords(userId, options)` - 获取练习记录列表
- `batchUpdateLetterStats(userId, stats)` - 批量更新字母统计
- `getLetterStats(userId)` - 获取字母统计

**代码位置**:
- `src/services/api/exercise.api.ts`
- `src/stores/exercise.ts` (修改)

---

### 4. 游戏模块 (Game)

**功能**: 游戏记录管理

**数据库表**:
- `game_records` - 游戏记录

**API 接口**:
- `saveGameRecord(userId, gameType, record)` - 保存游戏记录
- `getGameRecord(userId, gameType, date)` - 获取游戏记录
- `getGameRecords(userId, options)` - 获取游戏记录列表

**代码位置**:
- `src/services/api/game.api.ts`
- `src/stores/game.ts` (修改)

---

### 5. 积分模块 (Points)

**功能**: 积分管理、积分记录

**数据库表**:
- `points_transactions` - 积分交易记录

**API 接口**:
- `getUserPoints(userId)` - 获取用户积分
- `addPoints(userId, amount, reason)` - 增加积分
- `deductPoints(userId, amount, reason)` - 扣除积分
- `getPointsHistory(userId, options)` - 获取积分历史

**代码位置**:
- `src/services/api/points.api.ts`
- `src/stores/user.ts` (修改，添加积分管理)

---

### 6. 礼物模块 (Gift)

**功能**: 礼物管理、兑换记录

**数据库表**:
- `gifts` - 礼物（系统表）
- `redeemed_gifts` - 已兑换礼物

**API 接口**:
- `getAvailableGifts()` - 获取可用礼物列表
- `getGiftById(giftId)` - 获取礼物详情
- `redeemGift(userId, giftId)` - 兑换礼物
- `getRedeemedGifts(userId)` - 获取用户兑换记录

**代码位置**:
- `src/services/api/gift.api.ts`
- `src/stores/user.ts` (修改，添加礼物管理)

**依赖**: 积分模块

---

### 7. 成就模块 (Achievement)

**功能**: 成就系统

**数据库表**:
- `achievements` - 成就记录

**API 接口**:
- `unlockAchievement(userId, achievementId)` - 解锁成就
- `getUserAchievements(userId)` - 获取用户成就列表
- `isAchievementUnlocked(userId, achievementId)` - 检查成就是否已解锁

**代码位置**:
- `src/services/api/achievement.api.ts`
- `src/stores/user.ts` (修改，添加成就管理)

---

### 8. 家长模块 (Parent)

**功能**: 家长-学生关联、家长功能

**数据库表**:
- `parent_student_relations` - 家长-学生关联
- `user_profiles` - 用户资料（添加 role 字段）

**API 接口**:
- `getUserRole(userId)` - 获取用户角色
- `updateUserRole(userId, role)` - 更新用户角色
- `getStudentList(parentId)` - 获取关联学生列表
- `addStudentRelation(parentId, studentId)` - 添加学生关联
- `removeStudentRelation(parentId, studentId)` - 移除学生关联
- `getStudentProgress(parentId, studentId)` - 查看学生进度
- `getStudentExerciseRecords(parentId, studentId)` - 查看学生练习记录
- `getStudentGameRecords(parentId, studentId)` - 查看学生游戏记录

**代码位置**:
- `src/services/api/parent.api.ts`
- `src/stores/parent.ts` (可选)

**依赖**: 用户模块、练习模块、游戏模块

---

### 9. 资源模块 (Resource)

**功能**: 字母、读音、单词、句子、课本等资源管理

**数据库表**:
- `pronunciation_resources` - 发音资源
- `word_resources` - 单词资源
- `sentence_resources` - 句子资源
- `textbook_resources` - 课本资源（未来）
- `pronunciation_records` - 发音使用记录（可选）
- `user_profiles` - 用户资料（添加发音设置字段）

**API 接口**:
- `getPronunciationSettings(userId)` - 获取发音设置
- `updatePronunciationSettings(userId, settings)` - 更新发音设置
- `getLetterPronunciation(letter, language?)` - 获取字母发音
- `getWordPronunciation(word, language?)` - 获取单词发音
- `getSentencePronunciation(sentence, language?)` - 获取句子发音
- `getWordResource(word)` - 获取单词资源
- `getSentenceResource(sentence)` - 获取句子资源
- `getTextbookResources(options?)` - 获取课本资源列表（未来）
- `recordPronunciationUsage(userId, type, content)` - 记录发音使用（可选）
- `getPronunciationStats(userId, options?)` - 获取发音统计（可选）

**代码位置**:
- `src/services/api/resource.api.ts`
- `src/stores/resource.ts` (可选)

**存储方案**:
- 音频文件：Supabase Storage
- 文本资源：数据库表

---

## 🔗 模块依赖关系

```
基础设施模块 (1)
    ↓
用户模块 (2) ──┐
    ↓          │
练习模块 (3) ←─┘
    ↓
游戏模块 (4) ←─┐
    ↓          │
积分模块 (5) ←─┘
    ↓
礼物模块 (6) ←─┐
    ↓          │
成就模块 (7) ←─┘
    ↓
家长模块 (8) ←─┐
    ↓          │
资源模块 (9) ←─┘
```

---

## ✅ 模块划分合理性检查

### 优点

1. ✅ **职责清晰**: 每个模块职责单一，边界明确
2. ✅ **依赖合理**: 模块间依赖关系清晰，无循环依赖
3. ✅ **可扩展**: 资源模块设计支持未来扩展（课本等）
4. ✅ **可测试**: 每个模块可独立测试
5. ✅ **可维护**: 模块化便于维护和迭代
6. ✅ **符合业务**: 模块划分符合实际业务需求

### 模块覆盖检查

| 需求 | 对应模块 | 状态 |
|------|----------|------|
| 用户管理 | 用户模块 | ✅ |
| 练习功能 | 练习模块 | ✅ |
| 游戏功能 | 游戏模块 | ✅ |
| 积分系统 | 积分模块 | ✅ |
| 礼物系统 | 礼物模块 | ✅ |
| 成就系统 | 成就模块 | ✅ |
| 家长功能 | 家长模块 | ✅ |
| 字母资源 | 资源模块 | ✅ |
| 读音资源 | 资源模块 | ✅ |
| 单词资源 | 资源模块 | ✅ |
| 句子资源 | 资源模块 | ✅ |
| 课本资源 | 资源模块 | ✅ |

---

## 🎯 实施建议

### 阶段 1: 核心功能（必须）
1. 基础设施模块
2. 用户模块
3. 练习模块

### 阶段 2: 扩展功能（重要）
4. 游戏模块
5. 积分模块
6. 礼物模块
7. 成就模块

### 阶段 3: 高级功能（可选）
8. 家长模块
9. 资源模块

---

## 📝 总结

**模块总数**: 9 个模块
**数据库表**: 15 张表
**API 方法**: 44 个方法
**代码文件**: 约 20+ 个文件

所有模块已设计完成，可以按优先级分阶段实施。
