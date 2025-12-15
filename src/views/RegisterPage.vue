<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const accountName = ref('')
const nickname = ref('')
const email = ref('')
const password = ref('')
const role = ref<'student' | 'parent'>('student')

const formatError = ref('')
const uniqueError = ref('')
const generalError = ref('')
const successMessage = ref('')
const checking = ref(false)
let checkTimer: number | undefined

const redirectPath = computed(() => (route.query.redirect as string) || '/')

const validateAccount = () => {
  formatError.value = ''
  uniqueError.value = ''
  if (!accountName.value) return false
  if (!authStore.validateAccountName(accountName.value)) {
    formatError.value = '账户名格式不正确（仅小写字母和数字）'
    return false
  }
  return true
}

watch(accountName, (value) => {
  if (checkTimer) {
    clearTimeout(checkTimer)
  }
  if (!value || !validateAccount()) {
    checking.value = false
    return
  }
  checking.value = true
  checkTimer = window.setTimeout(async () => {
    try {
      const exists = await authStore.checkAccountNameExists(value)
      uniqueError.value = exists ? '该账户名已被使用' : ''
    } catch (err) {
      uniqueError.value = err instanceof Error ? err.message : '校验失败，请稍后重试'
    } finally {
      checking.value = false
    }
  }, 300)
})

onBeforeUnmount(() => {
  if (checkTimer) {
    clearTimeout(checkTimer)
  }
})

const handleSubmit = async () => {
  generalError.value = ''
  successMessage.value = ''

  const isValid = validateAccount()
  if (!isValid) return
  if (uniqueError.value) {
    generalError.value = uniqueError.value
    return
  }

  if (!nickname.value) {
    generalError.value = '请输入昵称'
    return
  }
  if (!email.value || !email.value.includes('@')) {
    generalError.value = '请输入有效邮箱（仅用于找回账号）'
    return
  }
  if (!password.value || password.value.length < 6) {
    generalError.value = '密码不少于 6 位'
    return
  }

  try {
    await authStore.register({
      accountName: accountName.value,
      nickname: nickname.value,
      email: email.value,
      password: password.value,
      role: role.value,
    })
    successMessage.value = '注册成功'
    router.replace(redirectPath.value)
  } catch (err) {
    generalError.value = err instanceof Error ? err.message : '注册失败，请稍后重试'
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1>注册</h1>
      <p class="subtitle">创建新账户，支持 student / parent 角色</p>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <label class="field">
          <span>账户名</span>
          <input
            v-model.trim="accountName"
            type="text"
            placeholder="仅小写字母和数字"
            autocomplete="username"
          />
          <p v-if="formatError" class="message error">{{ formatError }}</p>
          <p v-else-if="uniqueError" class="message error">{{ uniqueError }}</p>
          <p v-else-if="checking" class="message">检查中...</p>
        </label>

        <label class="field">
          <span>昵称</span>
          <input v-model.trim="nickname" type="text" placeholder="用于显示" />
        </label>

        <label class="field">
          <span>邮箱</span>
          <input v-model.trim="email" type="email" placeholder="仅用于找回账号" autocomplete="email" />
        </label>

        <label class="field">
          <span>密码</span>
          <input v-model="password" type="password" placeholder="不少于 6 位" autocomplete="new-password" />
        </label>

        <label class="field">
          <span>角色</span>
          <div class="role-group">
            <label class="radio">
              <input v-model="role" type="radio" value="student" />
              <span>student（默认）</span>
            </label>
            <label class="radio">
              <input v-model="role" type="radio" value="parent" />
              <span>parent</span>
            </label>
          </div>
        </label>

        <button class="primary" type="submit" :disabled="authStore.loading || checking">
          {{ authStore.loading ? '注册中...' : '注册' }}
        </button>

        <p v-if="generalError" class="message error">{{ generalError }}</p>
        <p v-if="successMessage" class="message success">{{ successMessage }}</p>
      </form>

      <div class="footer">
        已有账号？
        <router-link class="link" to="/login">去登录</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
}

.auth-card {
  width: 100%;
  max-width: 520px;
  background: white;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

h1 {
  margin: 0;
  font-size: 26px;
}

.subtitle {
  margin: 6px 0 20px;
  color: #666;
  font-size: 14px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-weight: 600;
  color: #444;
}

.role-group {
  display: flex;
  gap: 16px;
}

.radio {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  color: #555;
}

input[type='text'],
input[type='email'],
input[type='password'] {
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  font-size: 14px;
}

input:focus {
  outline: none;
  border-color: var(--candy-pink);
  box-shadow: 0 0 0 3px rgba(255, 107, 157, 0.2);
}

button.primary {
  padding: 12px 16px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--candy-pink), var(--candy-orange));
  color: white;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

button.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

button.primary:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(255, 107, 157, 0.25);
}

.link {
  color: var(--candy-blue);
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
}

.link:hover {
  text-decoration: underline;
}

.message {
  margin: 0;
  font-size: 14px;
}

.message.error {
  color: #e11d48;
}

.message.success {
  color: #16a34a;
}

.footer {
  margin-top: 18px;
  font-size: 14px;
  color: #444;
}
</style>
