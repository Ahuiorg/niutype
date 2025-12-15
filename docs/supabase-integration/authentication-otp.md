# Supabase 验证码认证说明

## ✅ Supabase 内置支持验证码

**重要**: Supabase **内置支持** OTP（One-Time Password）验证码功能，**无需单独的服务**！

---

## 🔧 技术实现

### Supabase 内置功能

| 功能 | Supabase API | 说明 |
|------|-------------|------|
| **发送验证码** | `signInWithOtp({ email })` | Supabase 自动发送邮件 |
| **验证验证码** | `verifyOtp({ email, token, type })` | Supabase 自动验证 |
| **邮件发送** | Supabase 自动处理 | 无需第三方服务 |

### 代码示例

```typescript
// 发送验证码（注册或登录）
const { data, error } = await supabase.auth.signInWithOtp({
  email: 'user@example.com',
  options: {
    shouldCreateUser: true,  // 注册时设置为 true
    emailRedirectTo: 'https://leegpt.cn/welcome'
  }
})

// 验证验证码
const { data, error } = await supabase.auth.verifyOtp({
  email: 'user@example.com',
  token: '123456',  // 用户输入的验证码
  type: 'email'
})
```

---

## 📧 邮件模板配置

### 需要在 Supabase Dashboard 配置

1. **登录 Supabase Dashboard**
2. **进入**: Authentication → Email Templates
3. **配置验证码邮件模板**:
   - 使用 `{{ .Token }}` 变量显示验证码
   - 自定义邮件内容（支持 HTML）

### 邮件模板示例

```html
<h2>您的验证码</h2>
<p>您的验证码是：<strong>{{ .Token }}</strong></p>
<p>验证码 10 分钟内有效</p>
```

---

## 💰 费用说明

### Supabase 免费版

- ✅ **每天可发送 3 封邮件**（包括验证码、密码重置等）
- ✅ 对于个人项目或小规模使用足够

### Supabase 付费版

- ✅ **每天可发送更多邮件**（根据套餐）
- ✅ 适合生产环境大规模使用

---

## 🎯 使用场景

### 场景 1: 验证码注册

```typescript
// 1. 发送验证码
await supabase.auth.signInWithOtp({
  email: 'user@example.com',
  options: { shouldCreateUser: true }
})

// 2. 用户输入验证码后验证
await supabase.auth.verifyOtp({
  email: 'user@example.com',
  token: '123456',
  type: 'email'
})
```

### 场景 2: 验证码登录

```typescript
// 1. 发送验证码
await supabase.auth.signInWithOtp({
  email: 'user@example.com'
})

// 2. 用户输入验证码后验证
await supabase.auth.verifyOtp({
  email: 'user@example.com',
  token: '123456',
  type: 'email'
})
```

---

## ✅ 总结

| 问题 | 答案 |
|------|------|
| **Supabase 支持验证码吗？** | ✅ 完全支持，内置功能 |
| **需要单独的服务吗？** | ❌ 不需要，Supabase 自动处理 |
| **需要配置什么？** | ✅ 只需在 Dashboard 配置邮件模板 |
| **有费用吗？** | ✅ 免费版每天 3 封邮件，付费版更多 |
| **支持手机号验证码吗？** | ✅ 支持，但本项目使用邮箱 |

---

## 📝 注意事项

1. **邮件模板配置**: 必须在 Supabase Dashboard 中配置邮件模板
2. **验证码有效期**: 默认 10 分钟（可在 Supabase 配置中修改）
3. **邮件发送限制**: 免费版每天 3 封，注意控制发送频率
4. **测试环境**: 开发时可以使用 Supabase 的测试邮件功能
