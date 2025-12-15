<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useParentStore } from '@/stores/parent'

const authStore = useAuthStore()
const parentStore = useParentStore()

const inviteCode = ref('')
const accountName = ref('')
const message = ref('')

const isParent = computed(() => authStore.session?.user?.user_metadata?.role === 'parent')
const bindDisabled = computed(() => parentStore.loading || (!inviteCode.value && !accountName.value))

onMounted(() => {
  if (isParent.value) {
    void parentStore.loadStudents()
  }
})

const handleBind = async () => {
  message.value = ''
  try {
    if (inviteCode.value) {
      await parentStore.bindStudentByInviteCode(inviteCode.value)
      inviteCode.value = ''
      message.value = '绑定成功'
    } else if (accountName.value) {
      await parentStore.bindStudentByAccountName(accountName.value)
      accountName.value = ''
      message.value = '绑定成功'
    }
  } catch {
    // error 已在 store 中设置
  }
}

const handleUnbind = async (studentId: string) => {
  message.value = ''
  try {
    await parentStore.unbindStudent(studentId)
    message.value = '解绑成功'
  } catch {
    // error 已在 store 中设置
  }
}

const handleSelect = (studentId: string) => {
  void parentStore.selectStudent(studentId)
}
</script>

<template>
  <div class="page">
    <div class="card">
      <h1>管理学生</h1>
      <p class="subtitle">通过邀请码或账户名绑定学生</p>

      <p v-if="!isParent" class="message error">仅家长账户可使用</p>

      <div class="section" v-if="isParent">
        <div class="field">
          <label>学生邀请码</label>
          <input v-model.trim="inviteCode" type="text" placeholder="输入学生的邀请码" />
        </div>
        <div class="field">
          <label>学生账户名</label>
          <input v-model.trim="accountName" type="text" placeholder="输入学生账户名" />
        </div>
        <button class="primary" type="button" :disabled="bindDisabled" @click="handleBind">
          {{ parentStore.loading ? '处理中...' : '绑定学生' }}
        </button>
      </div>

      <div class="section" v-if="isParent">
        <div class="section-header">
          <span>已绑定学生</span>
          <button class="ghost" type="button" @click="parentStore.loadStudents" :disabled="parentStore.loading">
            {{ parentStore.loading ? '刷新中...' : '刷新' }}
          </button>
        </div>
        <div v-if="parentStore.students.length === 0" class="empty">暂无绑定</div>
        <ul v-else class="list">
          <li v-for="item in parentStore.students" :key="item.relation.id" class="row">
            <div class="student-info" @click="handleSelect(item.relation.studentId)">
              <div class="name">{{ item.student?.nickname || item.student?.accountName || '未知' }}</div>
              <div class="muted">@{{ item.student?.accountName || '—' }}</div>
              <div class="muted small">等级：{{ item.student?.level ?? '—' }}</div>
            </div>
            <button class="ghost danger" type="button" @click="handleUnbind(item.relation.studentId)">解除绑定</button>
          </li>
        </ul>
      </div>

      <!-- 选中学生详情 -->
      <div class="section" v-if="isParent && parentStore.selectedStudentId">
        <div class="section-header">
          <span>学生详情</span>
          <button class="ghost" type="button" @click="parentStore.clearSelection">关闭</button>
        </div>
        <div v-if="parentStore.selectedStudentProgress" class="detail-box">
          <div>当前天数：{{ parentStore.selectedStudentProgress.currentDay }}</div>
          <div>连续天数：{{ parentStore.selectedStudentProgress.consecutiveDays }}</div>
          <div>总积分：{{ parentStore.selectedStudentProgress.totalPoints }}</div>
          <div>已用积分：{{ parentStore.selectedStudentProgress.usedPoints }}</div>
        </div>
        <div v-if="parentStore.selectedStudentExercises.length > 0">
          <div class="muted">最近练习记录（前 5 条）：</div>
          <ul class="mini-list">
            <li v-for="ex in parentStore.selectedStudentExercises.slice(0, 5)" :key="ex.id">
              {{ ex.date }} - 字符{{ ex.totalChars }}，准确率{{ (ex.accuracy * 100).toFixed(1) }}%
            </li>
          </ul>
        </div>
        <div v-if="parentStore.selectedStudentGames.length > 0">
          <div class="muted">最近游戏记录（前 5 条）：</div>
          <ul class="mini-list">
            <li v-for="g in parentStore.selectedStudentGames.slice(0, 5)" :key="g.id">
              {{ g.date }} - {{ g.gameType }}，{{ Math.floor(g.totalTimeMs / 60000) }}分钟
            </li>
          </ul>
        </div>
      </div>

      <p v-if="message" class="message success">{{ message }}</p>
      <p v-if="parentStore.error" class="message error">{{ parentStore.error }}</p>
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
  max-width: 720px;
  margin: 0 auto;
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
}
h1 { margin: 0; font-size: 24px; }
.subtitle { margin: 6px 0 16px; color: #64748b; }
.section { margin-top: 20px; display: flex; flex-direction: column; gap: 12px; }
.section-header { display: flex; justify-content: space-between; align-items: center; font-weight: 600; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field input { padding: 12px 14px; border-radius: 10px; border: 1px solid #e5e7eb; }
.primary { padding: 12px 14px; background: linear-gradient(135deg, var(--candy-pink), var(--candy-orange)); color: #fff; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; }
.primary:disabled { opacity: 0.6; cursor: not-allowed; }
.list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
.row { display: flex; justify-content: space-between; align-items: center; gap: 12px; border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; background: #f8fafc; }
.student-info { cursor: pointer; }
.student-info:hover .name { color: var(--candy-pink); }
.name { font-weight: 700; }
.muted { color: #94a3b8; }
.muted.small { font-size: 13px; }
.empty { padding: 12px; color: #94a3b8; background: #f8fafc; border-radius: 10px; border: 1px dashed #e2e8f0; }
.message { margin-top: 12px; }
.error { color: #e11d48; }
.success { color: #16a34a; }
.ghost { border: 1px solid #e5e7eb; background: #fff; border-radius: 10px; padding: 8px 10px; cursor: pointer; }
.ghost.danger { color: #e11d48; border-color: #fecaca; }
.detail-box { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px; display: flex; flex-direction: column; gap: 6px; }
.mini-list { list-style: none; padding: 0; margin: 8px 0 0; font-size: 13px; color: #64748b; }
.mini-list li { padding: 4px 0; border-bottom: 1px dashed #e2e8f0; }
.mini-list li:last-child { border-bottom: none; }
</style>
