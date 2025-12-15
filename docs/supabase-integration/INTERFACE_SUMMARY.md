# Supabase 集成 - 完整接口总结

## 📋 当前提案设计的接口（基础功能）

### 1. 认证接口（Authentication API）

| 接口方法 | 功能 | 说明 |
|---------|------|------|
| `signUp(email, password)` | 用户注册 | 创建新用户账号 |
| `signIn(email, password)` | 用户登录 | 邮箱密码登录 |
| `signOut()` | 用户登出 | 清除会话 |
| `getSession()` | 获取会话 | 检查当前登录状态 |
| `resetPassword(email)` | 重置密码 | 发送重置邮件 |

### 2. 用户相关接口（User API）

| 接口方法 | 功能 | 对应表 |
|---------|------|--------|
| `getUserProfile(userId)` | 获取用户资料 | `user_profiles` |
| `updateUserProfile(userId, data)` | 更新用户资料 | `user_profiles` |
| `getUserProgress(userId)` | 获取用户进度 | `user_progress` |
| `updateUserProgress(userId, data)` | 更新用户进度 | `user_progress` |

### 3. 练习相关接口（Exercise API）

| 接口方法 | 功能 | 对应表 |
|---------|------|--------|
| `saveExerciseRecord(userId, record)` | 保存每日练习记录 | `exercise_records` |
| `getExerciseRecords(userId, options)` | 获取练习记录列表 | `exercise_records` |
| `batchUpdateLetterStats(userId, stats)` | 批量更新字母统计 | `letter_stats` |
| `getLetterStats(userId)` | 获取字母统计 | `letter_stats` |

### 4. 成就相关接口（Achievement API）

| 接口方法 | 功能 | 对应表 |
|---------|------|--------|
| `unlockAchievement(userId, achievementId)` | 解锁成就 | `achievements` |
| `getUserAchievements(userId)` | 获取用户成就列表 | `achievements` |

### 5. 游戏相关接口（Game API）

| 接口方法 | 功能 | 对应表 |
|---------|------|--------|
| `saveGameRecord(userId, gameType, record)` | 保存游戏记录 | `game_records` |
| `getGameRecord(userId, gameType, date)` | 获取游戏记录 | `game_records` |

### 6. 礼物相关接口（Gift API）

| 接口方法 | 功能 | 对应表 |
|---------|------|--------|
| `getAvailableGifts()` | 获取可用礼物列表 | `gifts` |
| `redeemGift(userId, giftId)` | 兑换礼物 | `redeemed_gifts` |
| `getRedeemedGifts(userId)` | 获取用户兑换记录 | `redeemed_gifts` |

---

## 🆕 扩展功能接口（新增）

### 7. 用户角色接口（User Roles API）

| 接口方法 | 功能 | 对应表 |
|---------|------|--------|
| `getUserRole(userId)` | 获取用户角色 | `user_profiles` |
| `updateUserRole(userId, role)` | 更新用户角色 | `user_profiles` |
| `getStudentList(parentId)` | 获取关联学生列表 | `parent_student_relations` |
| `addStudentRelation(parentId, studentId)` | 添加学生关联 | `parent_student_relations` |
| `removeStudentRelation(parentId, studentId)` | 移除学生关联 | `parent_student_relations` |
| `getStudentProgress(parentId, studentId)` | 查看学生进度 | `user_progress` |
| `getStudentExerciseRecords(parentId, studentId)` | 查看学生练习记录 | `exercise_records` |

### 8. 发音功能接口（Pronunciation API）

| 接口方法 | 功能 | 对应表 |
|---------|------|--------|
| `getPronunciationSettings(userId)` | 获取发音设置 | `user_profiles` |
| `updatePronunciationSettings(userId, settings)` | 更新发音设置 | `user_profiles` |
| `getLetterPronunciation(letter, language?)` | 获取字母发音 | `pronunciation_resources` |
| `getWordPronunciation(word, language?)` | 获取单词发音 | `pronunciation_resources` |
| `getSentencePronunciation(sentence, language?)` | 获取句子发音 | `pronunciation_resources` |
| `recordPronunciationUsage(userId, type, content)` | 记录发音使用 | `pronunciation_records` |
| `getPronunciationStats(userId, options?)` | 获取发音统计 | `pronunciation_records` |

---

## 📊 数据库表总结

### 基础表（当前提案）

1. **user_profiles** - 用户资料
2. **user_progress** - 用户进度
3. **exercise_records** - 练习记录
4. **letter_stats** - 字母统计
5. **achievements** - 成就记录
6. **game_records** - 游戏记录
7. **gifts** - 礼物（系统表）
8. **redeemed_gifts** - 已兑换礼物

### 扩展表（新增）

9. **parent_student_relations** - 家长-学生关联表
10. **pronunciation_records** - 发音使用记录表（可选）
11. **pronunciation_resources** - 发音资源表（可选）

### 表字段扩展

**user_profiles 表新增字段**：
- `role` - 用户角色（'parent' | 'student'）
- `pronunciation_enabled` - 是否启用发音
- `pronunciation_volume` - 发音音量（0-100）
- `letter_pronunciation_enabled` - 是否启用字母发音
- `word_pronunciation_enabled` - 是否启用单词发音
- `sentence_pronunciation_enabled` - 是否启用句子发音

---

## ✅ 功能覆盖检查

### 基础功能 ✅
- [x] 用户认证（注册、登录、登出）
- [x] 用户数据同步
- [x] 练习记录存储
- [x] 游戏记录存储
- [x] 成就系统
- [x] 礼物系统

### 扩展功能 ✅
- [x] 用户角色区分（家长/学生）
- [x] 家长-学生关联
- [x] 家长查看学生数据
- [x] 发音功能设置
- [x] 字母发音
- [x] 单词发音
- [x] 句子发音
- [x] 发音使用统计（可选）

---

## 🎯 实施建议

### Phase 1: 基础功能（必须）
实施当前提案的基础功能，确保核心功能可用。

### Phase 2: 用户角色系统（推荐）
添加家长/学生角色支持，满足多用户场景。

### Phase 3: 发音功能（推荐）
添加发音功能，提升学习体验。

---

## 📝 注意事项

1. **发音资源存储**：
   - 方案 1: 使用 Supabase Storage（推荐，统一管理）
   - 方案 2: 使用第三方 TTS 服务实时生成
   - 方案 3: 使用 CDN 存储预生成音频

2. **权限控制**：
   - 学生：只能访问自己的数据
   - 家长：可以查看关联学生的数据，但不能修改

3. **数据迁移**：
   - 现有用户默认为 'student' 角色
   - 现有用户的 `sound_enabled` 映射到 `pronunciation_enabled`
