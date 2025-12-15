# Parent Module Specification

## ADDED Requirements

### Requirement: User Role System
系统 SHALL 支持用户角色区分，包括家长（parent）和学生（student）两种角色。

#### Scenario: 用户注册时设置角色
- **Given**: 用户在注册页面
- **When**: 用户选择角色并完成注册（未选择时默认 student）
- **Then**:
  - 在 `user_profiles` 表中创建记录，`role` 为 'parent' 或 'student'
  - 如果 role = student，生成唯一 `invite_code`（供家长绑定）
  - 如果 role = parent，不生成 `invite_code`

#### Scenario: 获取用户角色
- **Given**: 用户已登录
- **When**: 调用 `getUserRole(userId)`
- **Then**:
  - 从 `user_profiles` 表查询用户的角色
  - 返回 'parent' 或 'student'

#### Scenario: 更新用户角色
- **Given**: 用户已登录
- **When**: 管理员或用户自己更新角色
- **Then**:
  - 更新 `user_profiles` 表中的 `role` 字段
  - 验证角色值的有效性（只能是 'parent' 或 'student'）

### Requirement: Parent-Student Relations
系统 SHALL 支持家长-学生关联关系，允许一个家长管理多个学生。

#### Scenario: 家长添加学生关联（通过邀请码）
- **Given**: 家长用户已登录
- **When**: 家长输入学生的邀请码并提交
- **Then**:
  - 根据 `invite_code` 在 `user_profiles` 查找学生
  - 在 `parent_student_relations` 表中创建关联记录
  - 验证家长不能关联自己
  - 返回关联记录

#### Scenario: 家长添加学生关联（通过学生账户名）
- **Given**: 家长用户已登录
- **When**: 家长输入学生账户名并提交
- **Then**:
  - 在 `user_profiles` 按账户名查找学生
  - 在 `parent_student_relations` 表中创建关联记录
  - 验证家长不能关联自己
  - 返回关联记录

#### Scenario: 学生查看自己的绑定信息和邀请码
- **Given**: 学生用户已登录
- **When**: 学生进入“我的家长”页面
- **Then**:
  - 展示自己的 `invite_code`
  - 展示已绑定的家长列表（只读）

### Requirement: Parent Configurable Practice→Play Ratio
系统 SHALL 允许家长为学生配置练习与游戏时长的兑换比例和每日上限。

#### Scenario: 家长为学生设置兑换比例
- **Given**: 家长用户已登录且已绑定某学生
- **When**: 家长输入“练习 X 分钟 → 游戏 Y 分钟”和可选“每日上限”并保存
- **Then**:
  - 更新 `parent_student_relations` 表对应记录的 `practice_per_slot_minutes`、`play_per_slot_minutes`、`max_daily_play_minutes`
  - 后续该学生计算可玩时长时优先采用该配置

#### Scenario: 无配置时使用默认比例
- **Given**: 学生已登录
- **When**: 计算学生可玩时长且无家长配置
- **Then**:
  - 使用系统默认比例：练习 30 分钟 → 游戏 30 分钟
  - 单次会话上限仍为 30 分钟

#### Scenario: 家长查看关联学生列表
- **Given**: 家长用户已登录
- **When**: 调用 `getStudentList(parentId)`
- **Then**:
  - 从 `parent_student_relations` 表查询该家长的所有关联学生
  - 关联查询 `user_profiles` 表获取学生资料
  - 返回学生列表

#### Scenario: 家长移除学生关联
- **Given**: 家长用户已登录
- **When**: 家长选择移除某个学生关联
- **Then**:
  - 从 `parent_student_relations` 表中删除关联记录
  - 验证只有家长本人可以删除自己的关联

### Requirement: Parent Access to Student Data
系统 SHALL 允许家长查看关联学生的数据，但不能修改学生的练习数据。

#### Scenario: 家长查看学生进度
- **Given**: 家长用户已登录，且已关联学生
- **When**: 家长选择查看某个学生的进度
- **Then**:
  - 验证家长-学生关联关系存在
  - 从 `user_progress` 表查询学生的进度数据
  - 返回学生进度信息

#### Scenario: 家长查看学生练习记录
- **Given**: 家长用户已登录，且已关联学生
- **When**: 家长选择查看某个学生的练习记录
- **Then**:
  - 验证家长-学生关联关系存在
  - 从 `exercise_records` 表查询学生的练习记录
  - 支持分页和排序
  - 返回练习记录列表

#### Scenario: 家长查看学生游戏记录
- **Given**: 家长用户已登录，且已关联学生
- **When**: 家长选择查看某个学生的游戏记录
- **Then**:
  - 验证家长-学生关联关系存在
  - 从 `game_records` 表查询学生的游戏记录
  - 返回游戏记录列表

#### Scenario: 家长尝试修改学生数据（应被拒绝）
- **Given**: 家长用户已登录，且已关联学生
- **When**: 家长尝试修改学生的练习记录
- **Then**:
  - RLS 策略阻止操作
  - 返回权限错误
  - 学生数据保持不变

### Requirement: Role-Based Access Control
系统 SHALL 根据用户角色实施不同的访问控制策略。

#### Scenario: 学生访问自己的数据
- **Given**: 学生用户已登录
- **When**: 学生访问自己的数据
- **Then**:
  - RLS 策略允许访问
  - 只能访问自己的数据
  - 不能访问其他学生的数据

#### Scenario: 家长访问关联学生的数据
- **Given**: 家长用户已登录，且已关联学生
- **When**: 家长访问关联学生的数据
- **Then**:
  - RLS 策略允许查看（SELECT）
  - RLS 策略阻止修改（UPDATE/INSERT/DELETE）
  - 只能访问已关联学生的数据
