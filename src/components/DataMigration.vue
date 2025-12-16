<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {
  getMigrationStatus,
  migrateData,
  clearOldData,
  markMigrationCompleted,
  type OldLocalData,
  type MigrationResult,
} from '@/services/sync/migration.service'

const emit = defineEmits<{
  (e: 'completed'): void
  (e: 'skipped'): void
}>()

const status = ref<{
  hasOldData: boolean
  alreadyMigrated: boolean
  oldData: OldLocalData | null
} | null>(null)

const step = ref<'detect' | 'preview' | 'migrating' | 'result'>('detect')
const loading = ref(false)
const result = ref<MigrationResult | null>(null)

const summary = computed(() => {
  if (!status.value?.oldData) return null
  const data = status.value.oldData
  return {
    days: data.currentDay,
    points: data.totalPoints,
    records: data.dailyRecords.length,
    achievements: data.achievements.length,
    letters: Object.keys(data.letterStats).filter((k) => data.letterStats[k].totalAttempts > 0).length,
  }
})

onMounted(() => {
  status.value = getMigrationStatus()
  if (status.value.hasOldData && !status.value.alreadyMigrated) {
    step.value = 'preview'
  } else {
    emit('completed')
  }
})

const handleMigrate = async () => {
  if (!status.value?.oldData) return
  step.value = 'migrating'
  loading.value = true
  try {
    result.value = await migrateData(status.value.oldData)
    step.value = 'result'
  } finally {
    loading.value = false
  }
}

const handleSkip = () => {
  markMigrationCompleted()
  emit('skipped')
}

const handleFinish = () => {
  if (result.value?.success) {
    clearOldData()
  }
  emit('completed')
}
</script>

<template>
  <div v-if="step !== 'detect'" class="migration-overlay">
    <div class="migration-card">
      <!-- 预览步骤 -->
      <template v-if="step === 'preview'">
        <div class="icon">📦</div>
        <h2>发现本地数据</h2>
        <p class="desc">检测到您有旧版本的练习数据，是否迁移到云端？</p>

        <div v-if="summary" class="summary">
          <div class="item">
            <span class="label">练习天数</span>
            <span class="value">{{ summary.days }} 天</span>
          </div>
          <div class="item">
            <span class="label">总积分</span>
            <span class="value">{{ summary.points }} 分</span>
          </div>
          <div class="item">
            <span class="label">练习记录</span>
            <span class="value">{{ summary.records }} 条</span>
          </div>
          <div class="item">
            <span class="label">成就</span>
            <span class="value">{{ summary.achievements }} 个</span>
          </div>
          <div class="item">
            <span class="label">字母统计</span>
            <span class="value">{{ summary.letters }} 个</span>
          </div>
        </div>

        <div class="actions">
          <button class="primary" @click="handleMigrate">迁移到云端</button>
          <button class="ghost" @click="handleSkip">跳过，使用云端数据</button>
        </div>
      </template>

      <!-- 迁移中 -->
      <template v-if="step === 'migrating'">
        <div class="icon spinning">⏳</div>
        <h2>正在迁移数据...</h2>
        <p class="desc">请稍候，这可能需要几秒钟</p>
      </template>

      <!-- 结果 -->
      <template v-if="step === 'result' && result">
        <div class="icon">{{ result.success ? '✅' : '⚠️' }}</div>
        <h2>{{ result.success ? '迁移完成' : '部分迁移成功' }}</h2>

        <div v-if="result.migratedModules.length > 0" class="result-section">
          <div class="section-title success">✓ 已迁移</div>
          <ul>
            <li v-for="m in result.migratedModules" :key="m">{{ m }}</li>
          </ul>
        </div>

        <div v-if="result.skipped.length > 0" class="result-section">
          <div class="section-title muted">— 已跳过</div>
          <ul>
            <li v-for="s in result.skipped" :key="s">{{ s }}</li>
          </ul>
        </div>

        <div v-if="result.errors.length > 0" class="result-section">
          <div class="section-title error">✗ 错误</div>
          <ul>
            <li v-for="e in result.errors" :key="e">{{ e }}</li>
          </ul>
        </div>

        <div class="actions">
          <button class="primary" @click="handleFinish">继续使用</button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.migration-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
}

.migration-card {
  background: #fff;
  border-radius: 20px;
  padding: 32px;
  max-width: 420px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.icon.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

h2 {
  margin: 0 0 8px;
  font-size: 22px;
  color: #1e293b;
}

.desc {
  color: #64748b;
  margin: 0 0 20px;
}

.summary {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  color: #64748b;
}

.value {
  font-weight: 600;
  color: #1e293b;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.primary {
  padding: 14px 20px;
  background: linear-gradient(135deg, #ec4899, #f97316);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: transform 0.1s;
}

.primary:hover {
  transform: scale(1.02);
}

.ghost {
  padding: 12px 20px;
  background: transparent;
  color: #64748b;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  cursor: pointer;
}

.ghost:hover {
  background: #f8fafc;
}

.result-section {
  text-align: left;
  margin-bottom: 16px;
}

.section-title {
  font-weight: 600;
  margin-bottom: 6px;
}

.section-title.success {
  color: #16a34a;
}

.section-title.muted {
  color: #94a3b8;
}

.section-title.error {
  color: #e11d48;
}

.result-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.result-section li {
  padding: 4px 0;
  font-size: 14px;
  color: #475569;
}
</style>



