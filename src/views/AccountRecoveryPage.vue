<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const token = ref('')
const errorMessage = ref('')
const infoMessage = ref('')

const sendOtp = async () => {
  errorMessage.value = ''
  infoMessage.value = ''

  if (!email.value || !email.value.includes('@')) {
    errorMessage.value = '请输入有效邮箱'
    return
  }

  try {
    await authStore.sendOtp(email.value)
    infoMessage.value = '验证码已发送到邮箱，请查收'
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : '发送验证码失败，请稍后重试'
  }
}

const verifyOtp = async () => {
  errorMessage.value = ''
  infoMessage.value = ''

  if (!email.value || !token.value) {
    errorMessage.value = '请输入邮箱和验证码'
    return
  }

  try {
    await authStore.verifyOtp({ email: email.value, token: token.value })
    infoMessage.value = '验证成功，正在登录...'
    router.replace('/')
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : '验证码验证失败，请重试'
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1>找回账号</h1>
      <p class="subtitle">输入注册邮箱获取验证码，无需重置密码</p>

      <div class="auth-form">
        <label class="field">
          <span>邮箱</span>
          <input v-model.trim="email" type="email" placeholder="注册邮箱" autocomplete="email" />
        </label>

        <div class="actions">
          <button class="secondary" type="button" :disabled="authStore.loading" @click="sendOtp">
            {{ authStore.loading ? '发送中...' : '发送验证码' }}
          </button>
        </div>

        <label class="field">
          <span>验证码</span>
          <input v-model.trim="token" type="text" placeholder="输入收到的验证码" />
        </label>

        <button class="primary" type="button" :disabled="authStore.loading" @click="verifyOtp">
          {{ authStore.loading ? '验证中...' : '验证并登录' }}
        </button>

        <p v-if="errorMessage" class="message error">{{ errorMessage }}</p>
        <p v-if="infoMessage" class="message success">{{ infoMessage }}</p>
      </div>

      <div class="footer">
        记起密码了？
        <router-link class="link" to="/login">返回登录</router-link>
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
  max-width: 440px;
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
  justify-content: flex-end;
}

button.primary,
button.secondary {
  padding: 12px 16px;
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

button.primary {
  background: linear-gradient(135deg, var(--candy-pink), var(--candy-orange));
}

button.secondary {
  background: linear-gradient(135deg, var(--candy-blue), var(--candy-green));
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

button:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
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
