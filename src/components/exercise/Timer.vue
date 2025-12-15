<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  remainingMs: number
  totalMs: number
  isPaused?: boolean
  compact?: boolean
}>()

const progress = computed(() => {
  return ((props.totalMs - props.remainingMs) / props.totalMs) * 100
})

const timeDisplay = computed(() => {
  const totalSeconds = Math.ceil(props.remainingMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const isLowTime = computed(() => {
  return props.remainingMs < 5 * 60 * 1000 // 小于5分钟
})
</script>

<template>
  <!-- 紧凑模式 -->
  <div v-if="compact" class="timer-compact" :class="{ 'low-time': isLowTime, paused: isPaused }">
    <span class="timer-icon-compact">{{ isPaused ? '⏸️' : '⏱️' }}</span>
    <span class="timer-text-compact">{{ timeDisplay }}</span>
  </div>
  
  <!-- 完整模式 -->
  <div v-else class="timer" :class="{ 'low-time': isLowTime, paused: isPaused }">
    <div class="timer-circle">
      <svg viewBox="0 0 100 100">
        <circle 
          class="timer-bg" 
          cx="50" cy="50" r="45"
        />
        <circle 
          class="timer-progress" 
          cx="50" cy="50" r="45"
          :style="{ 
            strokeDasharray: `${2 * Math.PI * 45}`,
            strokeDashoffset: `${2 * Math.PI * 45 * (1 - progress / 100)}`
          }"
        />
      </svg>
      <div class="timer-content">
        <span class="timer-icon">{{ isPaused ? '⏸️' : '⏱️' }}</span>
        <span class="timer-text">{{ timeDisplay }}</span>
        <span class="timer-label">{{ isPaused ? '已暂停' : '剩余时间' }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 紧凑模式样式 */
.timer-compact {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--color-bg-primary);
  border-radius: var(--radius-md);
}

.timer-icon-compact {
  font-size: 1rem;
}

.timer-text-compact {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text-primary);
  font-family: 'JetBrains Mono', monospace;
}

.timer-compact.low-time .timer-text-compact {
  color: var(--color-error);
}

.timer-compact.paused .timer-text-compact {
  color: var(--color-text-secondary);
}

/* 完整模式样式 */
.timer {
  display: flex;
  align-items: center;
  justify-content: center;
}

.timer-circle {
  position: relative;
  width: 140px;
  height: 140px;
}

.timer-circle svg {
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
}

.timer-bg {
  fill: none;
  stroke: #e0e0e0;
  stroke-width: 8;
}

.timer-progress {
  fill: none;
  stroke: var(--color-primary);
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dashoffset 1s linear;
}

.low-time .timer-progress {
  stroke: var(--color-error);
}

.paused .timer-progress {
  stroke: var(--color-text-secondary);
}

.timer-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.timer-icon {
  font-size: 1.25rem;
}

.timer-text {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--color-text-primary);
}

.low-time .timer-text {
  color: var(--color-error);
  animation: pulse 1s ease infinite;
}

.paused .timer-text {
  color: var(--color-text-secondary);
}

.timer-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}
</style>
