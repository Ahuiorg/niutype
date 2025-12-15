# Tasks: 集成 Supabase 后端服务（模块化实施）

## 📦 模块实施顺序

### Phase 1: 核心模块（必须）

#### 模块 1: 基础设施模块

1. **创建 Supabase 项目**
   - [ ] 在 Supabase 控制台创建新项目
   - [ ] 记录项目 URL 和 API Key
   - [ ] 配置环境变量
   - [ ] 配置邮件模板（Authentication → Email Templates）
     - [ ] 配置验证码邮件模板（用于找回账号），使用 `{{ .Token }}` 显示验证码
     - [ ] 测试邮件发送功能
     - [ ] 注意：注册时不需要邮件验证，邮箱仅用于找回账号

2. **安装依赖**
   - [x] 安装 `@supabase/supabase-js` 包

3. **创建 Supabase 客户端**
   - [x] 创建 `src/services/supabase/client.ts`
   - [x] 初始化 Supabase 客户端
   - [x] 配置环境变量读取
   - [x] 导出客户端单例

4. **配置环境变量**
   - [x] 创建 `.env.example` 文件
   - [x] 创建 `.env.local` 文件（不提交到 Git）
   - [x] 在 `.gitignore` 中添加 `.env.local`
   - [x] 在 `vite.config.ts` 中配置环境变量

5. **创建认证服务**
   - [x] 创建 `src/services/auth/auth.types.ts`（类型定义）
   - [x] 创建 `src/services/auth/auth.service.ts`
   - [x] 实现 `validateAccountName(accountName)` 方法（验证账户名格式：只能小写字母和数字）
   - [x] 实现 `checkAccountNameExists(accountName)` 方法（检查账户名是否已被使用）
   - [x] 实现 `signUp(accountName, nickname, email, password, role?)` 方法（账户名密码注册，支持 parent/student，student 需生成邀请码）
   - [x] 实现 `getEmailByAccountName(accountName)` 方法（通过账户名查询邮箱）
   - [x] 实现 `signIn(accountName, password)` 方法（账户名密码登录）
   - [x] 实现 `signOut()` 方法
   - [x] 实现 `getSession()` 方法
   - [x] 实现 `sendRecoveryOtp(email)` 方法（发送找回账号验证码）
   - [x] 实现 `verifyRecoveryOtp(email, token)` 方法（验证找回账号验证码并登录）

6. **集成认证状态监听**
   - [x] 在 `src/main.ts` 中初始化认证监听
   - [x] 创建全局认证状态管理
   - [x] 处理登录/登出事件

7. **创建登录/注册页面**
   - [x] 创建登录页面组件
     - [x] 账户名输入框（提示：只能包含小写字母和数字）
     - [x] 密码输入框
     - [x] "忘记密码"链接（跳转到找回账号页面）
     - [x] 登录按钮
   - [x] 创建注册页面组件
     - [x] 账户名输入框（必填，实时验证格式和唯一性）
       - [x] 格式提示：只能包含小写字母和数字
       - [x] 实时检查账户名是否已被使用
     - [x] 昵称输入框（必填，用于显示）
     - [x] 邮箱输入框（必填，提示：邮箱仅用于找回账号）
     - [x] 密码输入框（必填）
     - [x] 角色选择（默认 student，可选 parent）
     - [x] 注册按钮
   - [x] 创建找回账号页面组件
     - [x] 邮箱输入框
     - [x] "发送验证码"按钮
     - [x] 验证码输入框
     - [x] "登录"按钮
     - [x] "重新发送验证码"按钮
   - [x] 学生端“我的家长”页面
     - [x] 展示邀请码
     - [x] 展示已绑定家长列表（只读）
   - [x] 家长端“管理学生”页面
     - [x] 通过邀请码绑定学生（占位界面，后续接 API）
     - [x] 通过学生账户名绑定学生（占位界面，后续接 API）
     - [x] 查看已绑定学生列表（只读占位）
     - [x] 查看学生进度、练习、游戏记录（只读占位）
     - [x] 解除绑定（占位按钮）
  - [x] 添加表单验证
    - [x] 账户名格式验证（正则：`^[a-z0-9]+$`）
    - [x] 账户名唯一性验证（调用 API 检查）
    - [x] 邮箱格式验证
    - [x] 密码强度验证
  - [x] 集成认证服务
  - [x] 添加路由保护

---

#### 模块 2: 用户模块

8. **创建用户模块数据库表**
   - [x] 创建 `user_profiles` 表（包含 `account_name`、`nickname`、`email`、`role`、`membership_tier`、`membership_expires_at`、`level`、`invite_code`）
   - [x] 创建 `user_progress` 表
   - [x] 创建索引（`account_name` 唯一；`email` 索引；`role` 索引；`membership_tier` 索引；`invite_code` 唯一）
   - [x] 创建触发器

9. **配置用户模块 RLS**
   - [x] 为 `user_profiles` 表启用 RLS
   - [x] 为 `user_progress` 表启用 RLS
   - [x] 创建 RLS 策略

10. **创建用户模块 API 服务**
    - [x] 创建 `src/services/api/user.api.ts`
    - [x] 实现 `checkAccountNameExists(accountName)` 方法（检查账户名是否已被使用）
    - [x] 实现 `getInviteCode(userId)` 方法（学生获取自己的邀请码）
    - [x] 实现 `getBoundParents(userId)` 方法（学生查看已绑定的家长，只读）
    - [x] 实现 `getUserMembership(userId)` 方法（返回 tier/expire/level）
    - [x] 实现 `updateMembership(userId, tier, expiresAt)` 方法
    - [x] 实现 `updateUserLevel(userId, level)` 方法（由积分/进度计算后回写）
    - [x] 实现 `getUserProfile()` 方法
    - [x] 实现 `updateUserProfile()` 方法
    - [x] 实现 `getUserProgress()` 方法
    - [x] 实现 `updateUserProgress()` 方法

11. **修改 user.ts Store**
    - [x] 添加认证状态管理
    - [x] 集成云端同步
    - [x] 保持向后兼容（支持离线模式）

---

#### 模块 3: 练习模块

12. **创建练习模块数据库表**
    - [x] 创建 `exercise_records` 表
    - [x] 创建 `letter_stats` 表
    - [x] 创建索引

13. **配置练习模块 RLS**
    - [x] 为 `exercise_records` 表启用 RLS
    - [x] 为 `letter_stats` 表启用 RLS
    - [x] 创建 RLS 策略

14. **创建练习模块 API 服务**
    - [x] 创建 `src/services/api/exercise.api.ts`
    - [x] 实现 `saveExerciseRecord()` 方法
    - [x] 实现 `getExerciseRecords()` 方法
    - [x] 实现 `batchUpdateLetterStats()` 方法
    - [x] 实现 `getLetterStats()` 方法

15. **修改 exercise.ts Store**
    - [x] 集成练习记录同步
    - [x] 支持离线模式
    - [x] 添加同步方法

---

### Phase 2: 扩展模块（重要）

#### 模块 4: 游戏模块

16. **创建游戏模块数据库表**
    - [x] 创建 `game_types` 表（游戏定义：membership/level/is_active/sort_order）
    - [x] 创建 `game_records` 表
    - [x] 创建索引

17. **配置游戏模块 RLS**
    - [x] 为 `game_records` 表启用 RLS
    - [x] 创建 RLS 策略
    - [x] `game_types` 表设为全局只读（可选择不开启 RLS 或创建只读策略）

18. **创建游戏模块 API 服务**
    - [x] 创建 `src/services/api/game.api.ts`
    - [x] 实现 `saveGameRecord()` 方法
    - [x] 实现 `getGameRecord()` 方法
    - [x] 实现 `getGameRecords()` 方法
    - [x] 实现 `getAvailableGames(userId)` 方法（按会员/等级过滤 game_types）
    - [x] 实现后台/配置的 `upsertGameType()` 方法（可选，用于新增/下架游戏）
    - [x] 实现 `getAvailablePlayMinutes(userId, date)`（计算当日可用游戏时长）
    - [x] 在开始游戏时校验：
      - 家长或 premium：跳过校验
      - 其他用户：需当日练习已完成且可用时长>0；单次会话上限 30 分钟

19. **修改 game.ts Store**
    - [x] 集成游戏记录同步
    - [x] 支持离线模式
    - [x] 添加同步方法

---

#### 模块 5: 积分模块

20. **创建积分模块数据库表**
    - [x] 创建 `points_transactions` 表
    - [x] 创建索引

21. **配置积分模块 RLS**
    - [x] 为 `points_transactions` 表启用 RLS
    - [x] 创建 RLS 策略（只读）

22. **创建积分模块 API 服务**
    - [x] 创建 `src/services/api/points.api.ts`
    - [x] 实现 `getUserPoints()` 方法
    - [x] 实现 `addPoints()` 方法
    - [x] 实现 `deductPoints()` 方法
    - [x] 实现 `getPointsHistory()` 方法

23. **集成积分模块到 user.ts Store**
    - [x] 添加积分管理方法
    - [x] 集成积分交易记录

---

#### 模块 6: 礼物模块

24. **创建礼物模块数据库表**
    - [x] 创建 `gifts` 表（系统表）
    - [x] 创建 `redeemed_gifts` 表
    - [x] 创建索引

25. **配置礼物模块 RLS**
    - [x] 为 `gifts` 表启用 RLS（所有用户可读）
    - [x] 为 `redeemed_gifts` 表启用 RLS
    - [x] 创建 RLS 策略

26. **创建礼物模块 API 服务**
    - [x] 创建 `src/services/api/gift.api.ts`
    - [x] 实现 `getAvailableGifts()` 方法
    - [x] 实现 `getGiftById()` 方法
    - [x] 实现 `redeemGift()` 方法
    - [x] 实现 `getRedeemedGifts()` 方法

27. **集成礼物模块到 user.ts Store**
    - [x] 添加礼物管理方法
    - [x] 集成兑换功能

---

#### 模块 7: 成就模块

28. **创建成就模块数据库表**
    - [x] 创建 `achievements` 表
    - [x] 创建索引

29. **配置成就模块 RLS**
    - [x] 为 `achievements` 表启用 RLS
    - [x] 创建 RLS 策略

30. **创建成就模块 API 服务**
    - [x] 创建 `src/services/api/achievement.api.ts`
    - [x] 实现 `unlockAchievement()` 方法
    - [x] 实现 `getUserAchievements()` 方法
    - [x] 实现 `isAchievementUnlocked()` 方法

31. **集成成就模块到 user.ts Store**
    - [x] 添加成就管理方法
    - [x] 集成成就解锁功能

---

### Phase 3: 高级功能（可选）

#### 模块 8: 家长模块

32. **扩展用户模块表结构**
    - [x] 在 `user_profiles` 表添加 `role` 字段
    - [x] 创建 `parent_student_relations` 表
    - [x] 创建索引

33. **配置家长模块 RLS**
    - [x] 为 `parent_student_relations` 表启用 RLS
    - [x] 创建 RLS 策略（家长可查看学生数据）

34. **创建家长模块 API 服务**
    - [x] 创建 `src/services/api/parent.api.ts`
    - [x] 实现 `getUserRole()` 方法
    - [x] 实现 `updateUserRole()` 方法
    - [x] 实现 `getStudentList()` 方法
    - [x] 实现 `addStudentRelation()` 方法
    - [x] 实现 `removeStudentRelation()` 方法
    - [x] 实现 `getStudentProgress()` 方法
    - [x] 实现 `getStudentExerciseRecords()` 方法
    - [x] 实现 `getStudentGameRecords()` 方法
    - [x] 实现/更新 `updatePracticePlayRatio(studentId, practiceMinutes, playMinutes, maxDailyMinutes?)`（家长配置练习→游戏比例）
    - [x] 实现 `getPracticePlayRatio(studentId)`（用于游戏时长计算）

35. **创建 parent.ts Store（可选）**
    - [x] 创建 `src/stores/parent.ts`
    - [x] 实现家长相关状态管理

---

#### 模块 9: 资源模块

36. **创建资源模块数据库表**
    - [ ] 创建 `pronunciation_resources` 表
    - [ ] 创建 `word_resources` 表
    - [ ] 创建 `sentence_resources` 表
    - [ ] 创建 `textbook_resources` 表（未来）
    - [ ] 创建 `pronunciation_records` 表（可选）
    - [ ] 创建索引

37. **配置资源模块 RLS**
    - [ ] 为资源表启用 RLS（系统资源所有用户可读）
    - [ ] 为 `pronunciation_records` 表启用 RLS
    - [ ] 创建 RLS 策略

38. **扩展用户模块表结构（发音设置）**
    - [ ] 在 `user_profiles` 表添加发音设置字段
    - [ ] 添加 `pronunciation_enabled`
    - [ ] 添加 `pronunciation_volume`
    - [ ] 添加 `letter_pronunciation_enabled`
    - [ ] 添加 `word_pronunciation_enabled`
    - [ ] 添加 `sentence_pronunciation_enabled`

39. **创建资源模块 API 服务**
    - [ ] 创建 `src/services/api/resource.api.ts`
    - [ ] 实现 `getPronunciationSettings()` 方法
    - [ ] 实现 `updatePronunciationSettings()` 方法
    - [ ] 实现 `getLetterPronunciation()` 方法
    - [ ] 实现 `getWordPronunciation()` 方法
    - [ ] 实现 `getSentencePronunciation()` 方法
    - [ ] 实现 `getWordResource()` 方法
    - [ ] 实现 `getSentenceResource()` 方法
    - [ ] 实现 `getTextbookResources()` 方法（未来）
    - [ ] 实现 `recordPronunciationUsage()` 方法（可选）
    - [ ] 实现 `getPronunciationStats()` 方法（可选）

40. **配置 Supabase Storage**
    - [ ] 创建 `resources` bucket
    - [ ] 配置存储策略
    - [ ] 上传初始资源文件（可选）

41. **创建 resource.ts Store（可选）**
    - [ ] 创建 `src/stores/resource.ts`
    - [ ] 实现资源缓存管理

---

### 跨模块功能

#### 数据同步服务

42. **创建数据同步服务**
    - [x] 创建 `src/services/sync/sync.service.ts`
    - [x] 实现 `syncToCloud()` 方法
    - [x] 实现 `syncFromCloud()` 方法
    - [x] 实现冲突检测逻辑
    - [x] 实现冲突解决策略

43. **创建数据迁移服务**
    - [x] 创建 `src/services/sync/migration.service.ts`
    - [x] 实现 `detectOldData()` 方法
    - [x] 实现 `migrateData()` 方法
    - [x] 实现数据验证逻辑
    - [x] 创建迁移 UI 组件

---

### 测试和优化

44. **端到端测试**
    - [x] 测试基础设施模块（认证流程）
      - [x] 用户注册（学生/家长角色）
      - [x] 用户登录
      - [x] 用户登出
      - [x] 新用户注册后数据初始化正确
    - [x] 测试用户模块（资料、进度同步）
      - [x] 练习进度保存到云端
      - [x] 从云端加载练习进度
      - [x] 移除 localStorage 持久化（完全使用云端存储）
      - [x] 今日进度（todayProgress）正确恢复
    - [x] 测试练习模块（记录同步）
      - [x] 练习记录保存到 exercise_records 表
      - [x] 字母统计保存到 letter_stats 表
      - [x] 练习结束时自动同步数据
      - [x] 准确率计算正确（包含错误输入场景）
      - [x] 今日进度按字符数计算（目标300字符）
    - [x] 测试统计模块（数据展示）
      - [x] 总字符数、准确率、反应时间正确显示
      - [x] 字母热力图按准确率正确着色
      - [x] 手指准确率统计正确
      - [x] 最近练习记录正确显示
    - [x] 测试成就模块（解锁流程）
      - [x] 成就列表正确显示
      - [x] 成就进度正确计算
      - [x] 成就解锁后同步到云端
      - [x] 页面加载时自动检查并同步待解锁成就
    - [ ] 测试游戏模块（记录同步）
    - [x] 测试积分模块（积分管理）
      - [x] 积分显示正确（可用积分、总获得、已使用）
      - [x] 可用积分计算正确（总积分 - 已使用）
      - [x] 积分从 user_progress 表同步（与兑换逻辑一致）
    - [x] 测试礼物模块（兑换流程）
      - [x] 家长可以为学生添加礼物
      - [x] 家长可以删除礼物
      - [x] 学生可以看到家长添加的礼物
      - [x] 学生积分不足时按钮禁用并显示差额
      - [x] 礼物数据按用户隔离（学生只能看到自己的礼物）
      - [x] 兑换确认弹窗正确显示消耗积分和剩余积分
      - [x] 兑换成功后积分实时更新
      - [x] 兑换成功后礼物出现在"待领取"区域
      - [x] 确认领取后移至"领取历史"
      - [x] 边界测试：积分刚好够兑换
      - [x] 边界测试：积分归零后所有礼物按钮禁用
      - [x] 边界测试：高价礼物（超出积分）正确显示差额
    - [x] 测试家长模块（关联、查看学生数据）
      - [x] 家长可以通过账户名绑定学生
      - [x] 一个学生只能被一个家长绑定
      - [x] 已绑定的学生显示在学生选择器中
      - [x] 家长可以切换不同学生管理礼物
    - [ ] 测试资源模块（发音、资源获取）
    - [ ] 测试离线模式
    - [ ] 测试数据迁移流程
    - [x] 测试 RLS 策略（确保数据隔离）
      - [x] 不同用户数据完全隔离
      - [x] 登出后重新登录数据保持
      - [x] 多用户（家长、学生1、学生2）数据完全独立
      - [x] 用户切换时数据正确清除和加载

45. **性能优化**
    - [ ] 优化批量操作
    - [ ] 实现增量同步
    - [ ] 优化查询性能
    - [ ] 添加本地缓存策略

46. **错误处理完善**
    - [x] 添加全局错误处理
    - [x] 添加用户友好的错误提示
    - [x] 添加错误日志记录
    - [x] 处理网络错误场景

47. **文档更新**
    - [ ] 更新 README.md（添加 Supabase 配置说明）
    - [ ] 创建数据库迁移文档
    - [ ] 创建 API 服务使用文档（按模块）
    - [ ] 更新项目文档

---

## 🐛 Bug 修复记录

### 2024-12-15: 积分同步问题

**问题描述**：
- 学生兑换礼物后，积分显示为0而不是正确的剩余积分
- 原因：`syncPointsFromCloud` 从 `points_transactions` 表获取积分，但实际积分存储在 `user_progress` 表中

**修复方案**：
- 修改 `src/stores/user.ts` 中的 `syncPointsFromCloud` 函数
- 改为从 `user_progress` 表获取 `totalPoints` 和 `usedPoints`
- 与 `redeemGift` API 保持一致的数据源

**相关文件**：
- `src/stores/user.ts`: 修复 `syncPointsFromCloud` 和 `redeemGiftCloud` 函数
- `src/services/api/gift.api.ts`: 重构礼物兑换 API

---

## Validation

- [ ] 运行 `openspec validate integrate-supabase-backend --strict`
- [ ] 修复所有验证错误
- [ ] 确保所有任务可验证和可测试
