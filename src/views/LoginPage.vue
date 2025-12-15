<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const accountName = ref('')
const password = ref('')
const errorMessage = ref('')
const successMessage = ref('')

const redirectPath = computed(() => (route.query.redirect as string) || '/')

const handleSubmit = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!accountName.value || !password.value) {
    errorMessage.value = '请输入账户名和密码'
    return
  }

  if (!authStore.validateAccountName(accountName.value)) {
    errorMessage.value = '账户名格式不正确（仅小写字母和数字）'
    return
  }

  try {
    await authStore.login(accountName.value, password.value)
    successMessage.value = '登录成功，正在跳转...'
    router.replace(redirectPath.value)
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : '登录失败，请重试'
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1>登录</h1>
      <p class="subtitle">使用账户名和密码登录</p>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <label class="field">
          <span>账户名</span>
          <input
            v-model.trim="accountName"
            name="account"
            type="text"
            placeholder="仅小写字母和数字"
            autocomplete="username"
          />
        </label>

        <label class="field">
          <span>密码</span>
          <input
            v-model="password"
            name="password"
            type="password"
            placeholder="请输入密码"
            autocomplete="current-password"
          />
        </label>

        <div class="actions">
          <button class="primary" type="submit" :disabled="authStore.loading">
            {{ authStore.loading ? '登录中...' : '登录' }}
          </button>
          <router-link class="link" to="/recover">忘记密码？</router-link>
        </div>

        <p v-if="errorMessage" class="message error">{{ errorMessage }}</p>
        <p v-if="successMessage" class="message success">{{ successMessage }}</p>
      </form>

      <div class="footer">
        还没有账号？
        <router-link class="link" to="/register">去注册</router-link>
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
  max-width: 420px;
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

input {
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

.actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

button.primary {
  flex: 1;
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
