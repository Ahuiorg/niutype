# Supabase 后端集成设计文档

## Context
NiuType 打字练习应用目前是完全的前端应用，所有数据存储在 localStorage。为了支持多设备同步、用户认证和未来功能扩展，需要集成 Supabase 作为后端服务。

## Goals / Non-Goals

### Goals
- 实现用户认证（注册、登录、登出）
- 实现数据云端存储和同步
- 保持代码组织清晰，模块化设计
- 支持从 localStorage 迁移到 Supabase
- 实现 Row Level Security (RLS) 数据安全策略
- 保持向后兼容（支持离线模式）

### Non-Goals
- 不实现复杂的后端业务逻辑（使用 Supabase 内置功能）
- 不实现实时协作功能（当前阶段）
- 不实现支付功能
- 不实现复杂的权限系统（仅用户自己的数据）

## Architecture Overview

### 代码组织结构（模块化设计）

```
src/
├── services/                    # 服务层（新增）
│   ├── supabase/               # 基础设施模块
│   │   ├── client.ts           # Supabase 客户端初始化
│   │   ├── types.ts            # 数据库类型定义（从 Supabase 生成）
│   │   └── rls-policies.sql    # RLS 策略 SQL
│   ├── auth/                   # 基础设施模块 - 认证服务
│   │   ├── auth.service.ts     # 认证相关 API 封装
│   │   └── auth.types.ts       # 认证类型定义
│   ├── api/                    # API 服务层（按模块划分）
│   │   ├── user.api.ts         # 用户模块 API
│   │   ├── exercise.api.ts     # 练习模块 API
│   │   ├── game.api.ts         # 游戏模块 API
│   │   ├── points.api.ts       # 积分模块 API
│   │   ├── gift.api.ts         # 礼物模块 API
│   │   ├── achievement.api.ts  # 成就模块 API
│   │   ├── parent.api.ts       # 家长模块 API
│   │   └── resource.api.ts     # 资源模块 API
│   └── sync/                   # 数据同步服务（跨模块）
│       ├── sync.service.ts     # 同步逻辑
│       ├── conflict.resolver.ts # 冲突解决策略
│       └── migration.service.ts # 数据迁移服务
├── stores/                     # Pinia Stores（按模块修改）
│   ├── user.ts                 # 用户模块（集成用户、积分、礼物、成就）
│   ├── exercise.ts             # 练习模块
│   ├── game.ts                 # 游戏模块
│   ├── parent.ts               # 家长模块（可选）
│   └── resource.ts             # 资源模块（可选）
└── utils/                      # 工具函数（新增）
    └── migration.ts             # 数据迁移工具
```

### 数据流设计

```
┌─────────────────┐
│  Vue Components │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Pinia Stores   │  ← 业务逻辑层
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Services   │  ← 统一 API 封装层
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Supabase Client│  ← Supabase SDK
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Supabase Cloud │  ← 云端服务
└─────────────────┘
```

## Database Schema Design

### 表结构设计原则
1. **用户数据隔离**：所有表通过 `user_id` 关联到 `auth.users`
2. **时间戳标准化**：统一使用 `TIMESTAMPTZ` 类型
3. **索引优化**：为常用查询字段添加索引
4. **数据完整性**：使用外键约束和检查约束

### 核心表结构

#### 1. user_profiles（用户资料表）
扩展 Supabase Auth 的用户信息

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  account_name TEXT UNIQUE NOT NULL,  -- 账户名（用于登录，只能小写字母和数字）
  nickname TEXT NOT NULL,             -- 昵称（用于显示）
  email TEXT NOT NULL,                -- 邮箱（冗余存储，用于登录时快速查询、找回账号）
  role TEXT NOT NULL DEFAULT 'student', -- 'parent' | 'student'
  invite_code TEXT UNIQUE,            -- 学生邀请码，用于家长绑定；家长不生成
  membership_tier TEXT NOT NULL DEFAULT 'free', -- 'free' | 'premium'
  membership_expires_at TIMESTAMPTZ,  -- 高级会员到期时间（可空，free 时为 null）
  level INTEGER NOT NULL DEFAULT 1,   -- 用户等级，依据积分/进度计算更新
  avatar_url TEXT,
  sound_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**字段说明**：
- `id`: 关联到 `auth.users.id`（Supabase 自动创建）
- `account_name`: 账户名（必填，唯一，用于登录，只能包含小写字母和数字）
- `nickname`: 昵称（必填，用于显示）
- `email`: 邮箱（必填，冗余存储，用于登录时通过账户名快速查询邮箱、找回账号）
- `role`: 角色（'parent' 或 'student'，默认 student）
- `invite_code`: 学生的邀请码，用于家长绑定（学生生成，家长不生成）
- `membership_tier`: 会员等级（free/premium），用于游戏/功能访问控制
- `membership_expires_at`: 高级会员过期时间（premium 时必填）
- `level`: 用户等级（整数），依据积分或进度计算后回写
- `avatar_url`: 头像 URL（可选，后续支持上传）
- `sound_enabled`: 音效开关设置
- `created_at/updated_at`: 创建和更新时间

**索引**：
```sql
CREATE UNIQUE INDEX idx_user_profiles_account_name ON user_profiles(account_name);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE UNIQUE INDEX idx_user_profiles_invite_code ON user_profiles(invite_code);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_membership_tier ON user_profiles(membership_tier);
```

**设计说明**：
- `email` 冗余存储，便于通过账户名快速查到邮箱并用于找回账号
- `role` 支持家长/学生权限控制，默认学生
- `invite_code` 用于家长绑定学生，学生注册后生成；家长账号不生成邀请码

#### 2. user_progress（用户进度表）
存储用户的核心进度数据

```sql
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_day INTEGER NOT NULL DEFAULT 1,
  consecutive_days INTEGER NOT NULL DEFAULT 0,
  last_completed_date DATE,
  total_points INTEGER NOT NULL DEFAULT 0,
  used_points INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);
```

**字段说明**：
- `current_day`: 当前解锁的天数
- `consecutive_days`: 连续打卡天数
- `last_completed_date`: 最后完成日期
- `total_points/used_points`: 积分统计

**积分系统说明**：
- `total_points`: 用户累计获得的总积分（通过练习获取）
- `used_points`: 用户已使用的积分（通过兑换礼物消耗）
- `可用积分` = `total_points` - `used_points`
- 积分获取：完成每日练习时根据打字字符数、准确率、连续天数计算
- 积分消耗：学生兑换家长创建的礼物时扣除

#### 3. exercise_records（练习记录表）
存储每日练习记录

```sql
CREATE TABLE exercise_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  date DATE NOT NULL,
  total_chars INTEGER NOT NULL DEFAULT 0,
  correct_chars INTEGER NOT NULL DEFAULT 0,
  total_time_ms INTEGER NOT NULL DEFAULT 0,
  earned_points INTEGER NOT NULL DEFAULT 0,
  accuracy DECIMAL(5,4) NOT NULL DEFAULT 0,
  avg_response_time_ms DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);
```

**字段说明**：
- `day`: 练习天数
- `date`: 练习日期（YYYY-MM-DD）
- `total_chars/correct_chars`: 字符统计
- `total_time_ms`: 练习时长（毫秒）
- `earned_points`: 获得的积分
- `accuracy`: 准确率（0-1）
- `avg_response_time_ms`: 平均反应时间

**索引**：
```sql
CREATE INDEX idx_exercise_records_user_date ON exercise_records(user_id, date DESC);
```

#### 4. letter_stats（字母统计表）
存储每个字母的详细统计

```sql
CREATE TABLE letter_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  letter TEXT NOT NULL,
  total_attempts INTEGER NOT NULL DEFAULT 0,
  correct_attempts INTEGER NOT NULL DEFAULT 0,
  total_response_time_ms BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, letter)
);
```

**字段说明**：
- `letter`: 字母（A-Z）
- `total_attempts`: 总尝试次数
- `correct_attempts`: 正确次数
- `total_response_time_ms`: 累计反应时间

**索引**：
```sql
CREATE INDEX idx_letter_stats_user ON letter_stats(user_id);
```

#### 5. achievements（成就记录表）
存储用户解锁的成就

```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);
```

**字段说明**：
- `achievement_id`: 成就 ID（对应前端定义的成就）
- `unlocked_at`: 解锁时间

**索引**：
```sql
CREATE INDEX idx_achievements_user ON achievements(user_id);
```

#### 6. game_types（游戏定义表）
存储可用游戏及访问规则（支持扩展新游戏）

```sql
CREATE TABLE game_types (
  id TEXT PRIMARY KEY,              -- 游戏唯一 ID，如 'snake' / 'tank'
  name TEXT NOT NULL,               -- 显示名称
  description TEXT,
  required_membership TEXT NOT NULL DEFAULT 'free', -- 'free' | 'premium'
  required_level INTEGER NOT NULL DEFAULT 1,        -- 解锁所需等级
  is_active BOOLEAN NOT NULL DEFAULT true,          -- 是否上架
  sort_order INTEGER NOT NULL DEFAULT 100,          -- 展示排序
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**字段说明**：
- `id`: 系统定义的游戏标识
- `required_membership`: 访问所需会员级别（free/premium）
- `required_level`: 解锁所需用户等级
- `is_active`: 控制是否对用户可见

**索引**：
```sql
CREATE INDEX idx_game_types_active ON game_types(is_active, sort_order);
CREATE INDEX idx_game_types_membership ON game_types(required_membership);
CREATE INDEX idx_game_types_level ON game_types(required_level);
```

**设计说明**：
- 通过表驱动方式新增/下架游戏，无需改代码
- 访问控制基于用户 `membership_tier` 与 `level`
- 允许未来添加更多字段（如封面、标签）
- 计算可玩游戏时：过滤 `is_active = true` 且满足 `membership_tier` 与 `level` 条件

#### 游戏时长与资格计算（逻辑层）
- 普通学生用户：
  - 当日练习未完成：不可进入游戏
  - 当日练习完成：解锁首个可玩时长（默认练 30 分 → 玩 30 分，可被家长配置）
  - 额外时长：按家长配置的比例“练 X 分钟 → 玩 Y 分钟”累进解锁；默认 30→30
  - 单次游戏会话上限：30 分钟
  - 当日可用时长 = floor(当日练习分钟 / practice_per_slot) * play_per_slot - 当日已玩分钟；最低 0
- 家长用户：无限制（无练习前置，无时长上限）
- 会员用户（premium）：无限制（即使是学生角色）
- 当前默认：所有非家长用户 membership_tier = free，需满足练习与时长规则

#### 7. parent_student_relations（家长-学生关联表）
存储家长-学生绑定关系及可配置的练习/游戏比例

```sql
CREATE TABLE parent_student_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  practice_per_slot_minutes INTEGER NOT NULL DEFAULT 30, -- 每多少分钟练习换算
  play_per_slot_minutes INTEGER NOT NULL DEFAULT 30,     -- 换算得到的可玩分钟
  max_daily_play_minutes INTEGER,  -- 可选每日上限（null 表示不限于换算结果）
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_id, student_id),
  UNIQUE(student_id)  -- 一个学生只能被一个家长绑定
);
```

**字段说明**：
- `practice_per_slot_minutes` / `play_per_slot_minutes`: 家长为该学生配置的练习↔游戏兑换比例（默认 30→30）
- `max_daily_play_minutes`: 可选每日上限；为空时仅受兑换比例约束

**设计说明**：
- 计算可用时长时，若存在绑定的家长配置，则优先使用该学生最新的一条配置；若无则使用系统默认 30→30
- 家长无限制自身游戏时长；此配置仅影响学生
- **一个学生只能被一个家长绑定**：通过 `UNIQUE(student_id)` 约束实现
- 一个家长可以绑定多个学生

#### 7. game_records（游戏记录表）
存储游戏相关记录

```sql
CREATE TABLE game_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL,  -- 'snake', 未来可扩展
  date DATE NOT NULL,
  total_time_ms INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, game_type, date)
);
```

**字段说明**：
- `game_type`: 游戏类型
- `date`: 游戏日期
- `total_time_ms`: 游戏时长
- `completed`: 是否用完当日时间

#### 7. gifts（礼物表）
存储家长为学生创建的礼物

```sql
CREATE TABLE gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  points INTEGER NOT NULL,
  image_url TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,  -- 创建礼物的家长
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,  -- 礼物所属的学生
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_gifts_created_by ON gifts(created_by);
CREATE INDEX idx_gifts_student_id ON gifts(student_id);
```

**字段说明**：
- `created_by`: 创建礼物的家长ID
- `student_id`: 礼物所属的学生ID（只有该学生可以兑换）
- `is_active`: 是否启用

**设计说明**：
- 家长为绑定的学生创建礼物，学生只能看到和兑换属于自己的礼物
- 家长只能管理自己创建的礼物
- 礼物与学生一对多关系：一个学生可以有多个礼物

#### 8. redeemed_gifts（已兑换礼物表）
存储用户兑换的礼物

```sql
CREATE TABLE redeemed_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gift_id UUID NOT NULL REFERENCES gifts(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  claimed_at TIMESTAMPTZ
);
```

**字段说明**：
- `gift_id`: 关联到礼物表
- `points`: 兑换时消耗的积分
- `claimed_at`: 领取时间（可选）

**索引**：
```sql
CREATE INDEX idx_redeemed_gifts_user ON redeemed_gifts(user_id);
```

### 数据库函数和触发器

#### 自动更新 updated_at
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Row Level Security (RLS) 策略

### 策略设计原则
1. **默认拒绝**：所有表默认拒绝访问
2. **用户隔离**：用户只能访问自己的数据
3. **系统表**：gifts 表允许所有认证用户读取

### RLS 策略实现

#### user_profiles
```sql
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

#### exercise_records
```sql
ALTER TABLE exercise_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own exercise records"
  ON exercise_records FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

#### letter_stats
```sql
ALTER TABLE letter_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own letter stats"
  ON letter_stats FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

#### achievements
```sql
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own achievements"
  ON achievements FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

#### game_records
```sql
ALTER TABLE game_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own game records"
  ON game_records FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

#### gifts（系统表，所有用户可读）
```sql
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active gifts"
  ON gifts FOR SELECT
  TO authenticated
  USING (is_active = true);
```

#### redeemed_gifts
```sql
ALTER TABLE redeemed_gifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own redeemed gifts"
  ON redeemed_gifts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

## Service Layer Design

### 1. Supabase Client 初始化
**文件**: `src/services/supabase/client.ts`

**职责**：
- 初始化 Supabase 客户端
- 配置认证状态监听
- 导出类型定义

**设计要点**：
- 使用环境变量配置 URL 和 Key
- 支持开发/生产环境切换
- 提供类型安全的客户端
- 配置邮件模板（在 Supabase Dashboard 中配置）

**Supabase 邮件模板配置**：
- 在 Supabase Dashboard → Authentication → Email Templates 中配置
- 配置验证码邮件模板（用于找回账号），使用 `{{ .Token }}` 变量显示验证码
- Supabase 免费版每天可发送 3 封邮件，付费版更多
- 注册时不需要邮件验证（邮箱仅用于找回账号）

### 2. 认证服务
**文件**: `src/services/auth/auth.service.ts`

**职责**：
- 用户注册（账户名、昵称、邮箱、密码）
- 用户登录（账户名、密码）
- 用户登出
- 会话管理
- 账号找回（邮箱验证码）

**设计要点**：
- 封装 Supabase Auth API
- 统一的错误处理
- 类型安全
- 支持多种认证方式

**认证方式设计决策**：

#### Decision: 注册和登录使用账户名方式
**What**: 注册时需要输入账户名、昵称、邮箱、密码；登录时使用账户名和密码。

**Why**: 
- **账户名更友好**: 账户名比邮箱更容易记住，对儿童更友好
- **昵称独立**: 昵称用于显示，账户名用于登录，职责清晰
- **邮箱用途明确**: 明确告知邮箱仅用于找回账号，降低用户顾虑
- **降低复杂度**: 不需要验证码验证，注册流程更快

**注册表单字段**:
- 账户名（必填）：用于登录，只能包含小写字母和数字，唯一
- 昵称（必填）：用于显示在应用中
- 邮箱（必填）：用于找回账号
- 密码（必填）：用于登录
- 提示信息：告知用户"邮箱仅用于找回账号"

**登录方式**:
- 账户名（必填）：用户输入的账户名
- 密码（必填）：用户输入的密码

**技术实现**:
- 注册：
  1. 验证账户名格式（正则：`^[a-z0-9]+$`）
  2. 检查账户名是否已被使用（查询 `user_profiles` 表）
  3. 调用 `supabase.auth.signUp({ email, password })` API 注册
  4. 注册成功后，自动创建 `user_profiles` 记录（包含账户名、昵称、邮箱）
- 登录：
  1. 通过账户名查询 `user_profiles` 表获取对应的 `email`
  2. 如果账户名不存在，返回错误
  3. 如果账户名存在，使用查询到的 `email` 和用户输入的密码调用 `supabase.auth.signInWithPassword({ email, password })` API
- 数据存储：
  - 账户名存储在 `user_profiles.account_name` 字段，唯一索引
  - 邮箱同时存储在 `auth.users.email` 和 `user_profiles.email` 字段（冗余存储，便于登录查询）

**账户名格式规则**:
- 只能包含小写字母（a-z）和数字（0-9）
- 不允许大写字母、特殊字符、空格
- 必须唯一
- 建议长度：3-20 个字符
- 学生注册后生成邀请码 `invite_code`，用于家长绑定

#### Parent/Student 访问与绑定流程

**家长登录与操作**
- 登录方式：账户名 + 密码（role = parent）
- 登录后可：
  - 查看自己的学生列表
  - 通过学生账户名或学生的邀请码添加关联
  - 查看每个学生的进度、练习、游戏记录（只读）
  - 移除关联
  - 不能修改学生数据（RLS 阻止）

**学生注册与登录**
- 注册：账户名 + 昵称 + 邮箱 + 密码，role 默认 student
- 注册完成后生成唯一邀请码 `invite_code`
- 登录：账户名 + 密码
- 学生端可查看自己的邀请码，并看到已绑定的家长列表（只读）

**绑定方式**
- 方式 1：家长输入学生的邀请码绑定
- 方式 2：家长输入学生账户名绑定
- 校验：
  - 账户存在且 role = student
  - 家长不能绑定自己
  - 相同家长-学生不可重复绑定

**Alternatives considered**:
- 邮箱登录：被拒绝，邮箱对儿童不够友好
- 验证码注册：被拒绝，增加注册复杂度，对儿童不友好
- 手机号注册：被拒绝，7岁儿童通常没有手机号
- 社交登录：被拒绝，需要第三方账号，增加复杂度

#### Decision: 账号找回使用邮箱验证码方式
**What**: 忘记密码时，通过邮箱验证码找回账号（无需重置密码）。

**Why**:
- **便捷性**: 验证码登录无需重置密码，更快捷
- **安全性**: 通过邮箱验证，确保账号安全
- **用户友好**: 用户无需记住新密码，直接登录即可
- **Supabase 内置**: 无需额外服务，Supabase 自动处理邮件发送

**实现方式**:
- 用户在登录页面点击"忘记密码"
- 输入注册邮箱，点击"发送验证码"
- Supabase 自动发送包含验证码的邮件
- 用户输入验证码即可登录，无需重置密码

**技术实现**:
- 使用 `supabase.auth.signInWithOtp({ email })` API 发送验证码
- 使用 `supabase.auth.verifyOtp({ email, token, type: 'email' })` API 验证验证码
- Supabase 自动处理邮件发送（需要配置邮件模板）

### 3. API 服务层
**职责**：统一封装所有 Supabase 数据库操作

**文件组织**：
- `user.api.ts`: 用户资料、进度相关操作
- `exercise.api.ts`: 练习记录相关操作
- `game.api.ts`: 游戏记录相关操作
- `achievement.api.ts`: 成就相关操作

**设计要点**：
- 每个 API 文件对应一个业务领域
- 统一的错误处理
- 统一的返回类型
- 支持批量操作

### 4. 数据同步服务
**文件**: `src/services/sync/sync.service.ts`

**职责**：
- 本地数据 → 云端同步
- 云端数据 → 本地同步
- 冲突检测和解决
- 增量同步优化

**设计要点**：
- 支持离线模式（先存本地，上线后同步）
- 冲突解决策略（时间戳优先）
- 批量同步优化

### 5. 数据迁移服务
**文件**: `src/services/sync/migration.service.ts`

**职责**：
- 检测 localStorage 中的旧数据
- 迁移到 Supabase
- 迁移后清理 localStorage（可选）

**设计要点**：
- 一次性迁移
- 数据验证
- 迁移进度提示

## Integration with Pinia Stores

### 修改策略
1. **保持现有接口不变**：Store 的对外接口保持兼容
2. **内部实现切换**：Store 内部调用 API 服务而不是直接操作 localStorage
3. **渐进式迁移**：支持离线模式，逐步切换到云端

### user.ts Store 修改
- `userData` 从 Supabase 加载
- `completeDay()` 同步到云端
- `recordInput()` 批量同步到云端
- 添加 `syncToCloud()` 和 `syncFromCloud()` 方法

### exercise.ts Store 修改
- 练习记录自动同步到云端
- 支持离线模式（先存本地）

### game.ts Store 修改
- 游戏记录同步到云端
- 支持离线模式

## Migration Plan

### 阶段 1: 数据库和基础设施
1. 在 Supabase 创建所有表
2. 配置 RLS 策略
3. 创建索引和触发器
4. 初始化 Supabase 客户端

### 阶段 2: 认证系统
1. 实现认证服务
2. 添加登录/注册页面
3. 集成到应用路由

### 阶段 3: 数据同步
1. 实现 API 服务层
2. 修改 Pinia Stores
3. 实现同步服务

### 阶段 4: 数据迁移
1. 实现迁移工具
2. 添加迁移 UI
3. 测试迁移流程

### 阶段 5: 测试和优化
1. 端到端测试
2. 性能优化
3. 错误处理完善

## Risks / Trade-offs

### Risk: 数据同步冲突
**Mitigation**: 
- 使用时间戳解决冲突
- 提供手动解决冲突的 UI
- 记录冲突日志

### Risk: 离线体验下降
**Mitigation**:
- 保持本地缓存
- 支持离线模式
- 上线后自动同步

### Risk: 性能问题
**Mitigation**:
- 批量操作优化
- 增量同步
- 本地缓存策略

### Trade-off: 数据一致性 vs 性能
**Decision**: 采用最终一致性，允许短暂的数据不一致，通过定期同步保证最终一致。

## Open Questions
- 是否需要实时同步（Realtime）？（当前阶段不需要）
- 是否需要数据版本控制？（当前阶段不需要）
- 是否需要数据导出功能？（后续考虑）
