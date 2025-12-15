<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  current: number
  total: number
  label?: string
}>()

const percentage = computed(() => {
  if (props.total === 0) return 0
  return Math.min(100, (props.current / props.total) * 100)
})
</script>

<template>
  <div class="progress-container">
    <div v-if="label" class="progress-label">
      <span>{{ label }}</span>
      <span class="progress-value">{{ current }} / {{ total }}</span>
    </div>
    <div class="progress-track">
      <div 
        class="progress-fill"
        :style="{ width: `${percentage}%` }"
      >
        <div class="progress-glow"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.progress-container {
  width: 100%;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.progress-value {
  font-weight: 600;
  color: var(--color-text-primary);
}

.progress-track {
  width: 100%;
  height: 12px;
  background: #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light));
  border-radius: 6px;
  transition: width 0.3s ease;
  position: relative;
  min-width: 12px;
}

.progress-glow {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 20px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5));
  animation: shimmer 1.5s ease infinite;
}

@keyframes shimmer {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>

