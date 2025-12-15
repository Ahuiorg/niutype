<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getInviteCode, getBoundParents } from '@/services/api/user.api'

const authStore = useAuthStore()
const inviteCode = ref<string | null>(null)
const parents = ref<Array<{ id: string; accountName: string; nickname: string }>>([])
const loading = ref(false)
const error = ref('')

const isStudent = computed(() => authStore.session?.user?.user_metadata?.role !== 'parent')

const loadData = async () => {
  if (!authStore.session?.user?.id) return
  loading.value = true
  error.value = ''
  try {
    inviteCode.value = await getInviteCode(authStore.session.user.id)
    parents.value = await getBoundParents(authStore.session.user.id)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadData()
})
</script>

<template>
  <div class="page">
    <div class="card">
      <h1>我的家长</h1>
      <p class="subtitle">查看邀请码与已绑定的家长</p>

      <p v-if="!isStudent" class="message error">仅学生账户可查看</p>
      <p v-if="error" class="message error">{{ error }}</p>

      <div class="section" v-if="isStudent">
        <div class="section-header">
          <span>我的邀请码</span>
          <button class="ghost" type="button" @click="loadData" :disabled="loading">
            {{ loading ? '刷新中...' : '刷新' }}
          </button>
        </div>
        <div class="invite">
          <span class="code">{{ inviteCode || '尚未生成' }}</span>
          <small class="hint">家长可用邀请码或账户名绑定你</small>
        </div>
      </div>

      <div class="section" v-if="isStudent">
        <div class="section-header">
          <span>已绑定家长</span>
        </div>
        <div v-if="parents.length === 0" class="empty">暂无绑定</div>
        <ul v-else class="list">
          <li v-for="p in parents" :key="p.id">
            <div class="row">
              <div class="name">{{ p.nickname || p.accountName }}</div>
              <div class="muted">@{{ p.accountName }}</div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 32px 16px;
}
.card {
  max-width: 640px;
  margin: 0 auto;
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
}
h1 { margin: 0; font-size: 24px; }
.subtitle { margin: 6px 0 16px; color: #64748b; }
.section { margin-top: 20px; }
.section-header { display: flex; justify-content: space-between; align-items: center; font-weight: 600; }
.invite { margin-top: 10px; padding: 12px 14px; border: 1px dashed #cbd5e1; border-radius: 10px; background: #f8fafc; }
.code { font-weight: 700; font-size: 18px; }
.hint { display: block; margin-top: 6px; color: #94a3b8; }
.list { list-style: none; padding: 0; margin: 12px 0 0; display: flex; flex-direction: column; gap: 10px; }
.row { display: flex; align-items: center; gap: 8px; }
.name { font-weight: 600; }
.muted { color: #94a3b8; font-size: 13px; }
.empty { padding: 12px; color: #94a3b8; background: #f8fafc; border-radius: 10px; border: 1px dashed #e2e8f0; }
.message { margin: 8px 0; }
.error { color: #e11d48; }
.ghost { border: 1px solid #e5e7eb; background: #fff; border-radius: 10px; padding: 6px 10px; cursor: pointer; }
.ghost:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
