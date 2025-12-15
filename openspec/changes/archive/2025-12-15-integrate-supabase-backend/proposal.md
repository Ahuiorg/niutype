# Change: 集成 Supabase 后端服务

## Why
当前应用使用 localStorage 存储所有用户数据，存在以下限制：
- 数据仅存储在本地，无法跨设备同步
- 无法实现用户认证和多用户支持
- 无法实现排行榜、社交功能等需要服务端支持的功能
- 数据容易丢失（清除浏览器数据）

集成 Supabase 后可以：
- 实现用户注册、登录、多设备数据同步
- 支持云端数据存储，防止数据丢失
- 为后续功能（排行榜、社交分享）提供基础
- 保持代码组织清晰，模块化设计

## What Changes

### 模块化设计
本提案采用模块化设计，分为 9 个独立模块，按优先级分阶段实施：

#### Phase 1: 核心模块（必须）
1. **基础设施模块** - Supabase 配置、认证基础
2. **用户模块** - 用户资料、进度、设置
3. **练习模块** - 练习记录、字母统计

#### Phase 2: 扩展模块（重要）
4. **游戏模块** - 游戏记录
5. **积分模块** - 积分管理、积分记录
6. **礼物模块** - 礼物管理、兑换记录
7. **成就模块** - 成就系统

#### Phase 3: 高级功能（可选）
8. **家长模块** - 家长-学生关联、家长功能
9. **资源模块** - 字母、读音、单词、句子、课本等资源

### 详细变更

- **ADDED**: Supabase 数据库表结构设计（按模块划分）
  - 基础设施：Supabase Auth（内置）
  - 用户模块：user_profiles, user_progress
  - 练习模块：exercise_records, letter_stats
  - 游戏模块：game_records
  - 积分模块：points_transactions
  - 礼物模块：gifts, redeemed_gifts
  - 成就模块：achievements
  - 家长模块：parent_student_relations
  - 资源模块：pronunciation_resources, word_resources, sentence_resources, textbook_resources
- **ADDED**: 模块化 API 服务层（每个模块独立的 API 服务）
- **ADDED**: 数据同步服务模块（支持离线模式和冲突解决）
- **ADDED**: Row Level Security (RLS) 策略配置（按模块配置）
- **ADDED**: 数据迁移工具（localStorage → Supabase）
- **ADDED**: 顶部导航栏集成用户信息展示和认证入口
  - 登录后在导航右侧展示当前用户昵称和角色标签（学生/家长）
  - 未登录时在导航右侧展示“未登录”提示和“登录”按钮，点击跳转登录页
  - 导航栏内提供登出按钮，统一调用 Supabase 认证登出逻辑

## Impact
- **Affected specs**: 
  - 新增 `infrastructure` 能力规范（基础设施模块）
  - 新增 `user` 能力规范（用户模块）
  - 新增 `exercise` 能力规范（练习模块）
  - 新增 `game` 能力规范（游戏模块）
  - 新增 `points` 能力规范（积分模块）
  - 新增 `gift` 能力规范（礼物模块）
  - 新增 `achievement` 能力规范（成就模块）
  - 新增 `parent` 能力规范（家长模块）
  - 新增 `resource` 能力规范（资源模块）
- **Affected code**: 
  - 新增 `src/services/supabase/` - Supabase 核心配置（基础设施模块）
  - 新增 `src/services/auth/` - 认证服务（基础设施模块）
  - 新增 `src/services/api/` - 模块化 API 服务层
    - `user.api.ts` - 用户模块 API
    - `exercise.api.ts` - 练习模块 API
    - `game.api.ts` - 游戏模块 API
    - `points.api.ts` - 积分模块 API
    - `gift.api.ts` - 礼物模块 API
    - `achievement.api.ts` - 成就模块 API
    - `parent.api.ts` - 家长模块 API
    - `resource.api.ts` - 资源模块 API
  - 新增 `src/services/sync/` - 数据同步服务
  - 修改 `src/stores/user.ts` - 集成云端同步（用户、积分、礼物、成就）
  - 修改 `src/stores/exercise.ts` - 集成云端记录（练习模块）
  - 修改 `src/stores/game.ts` - 集成云端记录（游戏模块）
  - 新增 `src/stores/parent.ts` - 家长模块 Store（可选）
  - 新增 `src/stores/resource.ts` - 资源模块 Store（可选）
  - 新增 `src/utils/migration.ts` - 数据迁移工具
  - 修改 `src/main.ts` - 初始化 Supabase
  - 新增环境变量配置
  - 修改 `src/components/common/NavBar.vue` - 显示当前用户信息并提供登录/登出入口
