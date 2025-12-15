# Infrastructure Module Specification

## ADDED Requirements

### Requirement: Supabase Client Initialization
系统 SHALL 初始化 Supabase 客户端，配置认证状态监听。

#### Scenario: 初始化 Supabase 客户端
- **Given**: 环境变量 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 已配置
- **When**: 应用启动时
- **Then**:
  - 创建 Supabase 客户端实例
  - 客户端使用环境变量中的 URL 和 Key
  - 客户端导出为单例，供其他模块使用

#### Scenario: 认证状态监听
- **Given**: Supabase 客户端已初始化
- **When**: 用户登录或登出
- **Then**:
  - 监听 `auth.onAuthStateChange` 事件
  - 更新应用全局认证状态
  - 触发数据同步（登录时）

### Requirement: User Registration
系统 SHALL 实现用户注册功能，需要输入账户名、昵称、邮箱和密码；支持选择角色（默认学生）。

#### Scenario: 账户名密码注册
- **Given**: 用户在注册页面
- **When**: 用户输入账户名、昵称、邮箱、密码，并选择角色（可选，默认 student）后提交
- **Then**:
  - 验证账户名格式（只能包含小写字母和数字）
  - 检查账户名是否已被使用
  - 调用 `supabase.auth.signUp({ email, password })` API
  - 注册成功后，自动创建 `user_profiles` 记录（包含账户名、昵称、邮箱、role）
  - 如果 role = student，为该学生生成唯一 `invite_code`
  - 显示注册成功提示
  - 自动登录或跳转到登录页面

#### Scenario: 注册表单验证
- **Given**: 用户提交注册表单
- **When**: 账户名为空、账户名格式不正确、账户名已被使用、昵称为空、邮箱格式不正确或密码不符合要求
- **Then**:
  - 显示相应的错误提示
  - 阻止注册请求
  - 表单保持用户输入

#### Scenario: 账户名格式验证
- **Given**: 用户输入账户名
- **When**: 账户名包含大写字母、特殊字符或空格
- **Then**:
  - 显示错误提示（"账户名只能包含小写字母和数字"）
  - 阻止提交
  - 提供格式说明

#### Scenario: 账户名唯一性验证
- **Given**: 用户输入账户名并提交
- **When**: 账户名已被其他用户使用
- **Then**:
  - 查询 `user_profiles` 表检查账户名是否存在
  - 显示错误提示（"该账户名已被使用，请选择其他账户名"）
  - 阻止注册请求

#### Scenario: 邮箱已注册处理
- **Given**: 用户提交注册表单
- **When**: 邮箱已被注册
- **Then**:
  - Supabase 返回邮箱已存在错误
  - 显示友好提示（"该邮箱已注册，请直接登录"）
  - 提供跳转到登录页面的链接

### Requirement: User Login
系统 SHALL 实现用户登录功能，使用账户名和密码登录方式。

#### Scenario: 账户名密码登录
- **Given**: 用户在登录页面
- **When**: 用户输入正确的账户名和密码并提交
- **Then**:
  - 通过账户名查询 `user_profiles` 表获取对应的 `email`
  - 如果账户名不存在，返回错误
  - 如果账户名存在，使用查询到的 `email` 和用户输入的密码调用 `supabase.auth.signInWithPassword({ email, password })` API
  - 登录成功，保存会话
  - 加载用户数据
  - 跳转到主页

#### Scenario: 登录失败处理
- **Given**: 用户在登录页面
- **When**: 用户输入错误的账户名或密码
- **Then**:
  - 如果账户名不存在，显示错误提示（"账户名不存在"）
  - 如果账户名存在但密码错误，显示错误提示（"密码错误"）
  - 不清空表单
  - 允许用户重试
  - 提供"忘记密码"链接

#### Scenario: 账户名不存在处理
- **Given**: 用户在登录页面
- **When**: 用户输入的账户名在 `user_profiles` 表中不存在
- **Then**:
  - 显示错误提示（"账户名不存在，请检查输入或先注册"）
  - 提供跳转到注册页面的链接
  - 不清空账户名输入框

### Requirement: User Logout
系统 SHALL 实现用户登出功能。

#### Scenario: 用户登出
- **Given**: 用户已登录
- **When**: 用户点击登出按钮
- **Then**:
  - 调用 `supabase.auth.signOut()` API
  - 清除本地会话
  - 清除本地缓存数据（可选）
  - 跳转到登录页面

### Requirement: Session Management
系统 SHALL 管理用户会话，支持自动登录。

#### Scenario: 检查现有会话
- **Given**: 应用启动
- **When**: 检查是否有有效会话
- **Then**:
  - 调用 `supabase.auth.getSession()` API
  - 如果有有效会话，自动登录
  - 加载用户数据
  - 如果会话过期，清除本地数据

#### Scenario: 会话刷新
- **Given**: 用户已登录
- **When**: 会话即将过期
- **Then**:
  - 自动刷新会话
  - 用户无感知
  - 保持登录状态

### Requirement: Account Recovery
系统 SHALL 实现账号找回功能，使用邮箱验证码方式找回账号。

#### Scenario: 通过验证码找回账号
- **Given**: 用户在登录页面点击"忘记密码"
- **When**: 用户输入注册邮箱并点击"发送验证码"
- **Then**:
  - 调用 `supabase.auth.signInWithOtp({ email })` API 发送验证码
  - Supabase 自动发送包含验证码的邮件（使用配置的邮件模板）
  - 显示"验证码已发送到邮箱，请查收"提示
  - 用户收到包含验证码的邮件
  - 提示用户"验证码可用于登录，无需重置密码"

#### Scenario: 验证码登录完成（找回账号）
- **Given**: 用户已收到验证码
- **When**: 用户输入验证码并提交
- **Then**:
  - 调用 `supabase.auth.verifyOtp({ email, token, type: 'email' })` API 验证验证码
  - 验证成功，自动登录
  - 加载用户数据
  - 跳转到主页

#### Scenario: 验证码过期或错误
- **Given**: 用户输入验证码
- **When**: 验证码已过期或输入错误
- **Then**:
  - Supabase 返回验证失败错误
  - 显示错误提示（"验证码错误或已过期"）
  - 允许用户重新发送验证码
  - 提供"重新发送验证码"按钮

#### Scenario: 重新发送验证码
- **Given**: 用户需要重新获取验证码
- **When**: 用户点击"重新发送验证码"按钮
- **Then**:
  - 调用 `supabase.auth.signInWithOtp({ email })` API 再次发送
  - 显示"验证码已重新发送"提示
  - 用户收到新的验证码邮件
  - 之前的验证码失效

#### Scenario: 账号不存在处理
- **Given**: 用户输入邮箱找回账号
- **When**: 邮箱未注册
- **Then**:
  - 显示友好提示（"该邮箱未注册，请先注册"）
  - 提供跳转到注册页面的链接
  - 不清空邮箱输入框
