<script setup lang="ts">
import { computed } from 'vue'
import { useErrors, type AppError } from '@/services/error/error.service'

const { errors, dismissError } = useErrors()

const visibleErrors = computed(() =>
  errors.value.filter((e) => !e.dismissed).slice(-5)
)

const getIcon = (severity: AppError['severity']) => {
  switch (severity) {
    case 'info':
      return 'ℹ️'
    case 'warning':
      return '⚠️'
    case 'error':
      return '❌'
  }
}
</script>

<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="error in visibleErrors"
          :key="error.id"
          class="toast"
          :class="error.severity"
        >
          <span class="icon">{{ getIcon(error.severity) }}</span>
          <span class="message">{{ error.message }}</span>
          <button class="close" @click="dismissError(error.id)">×</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 360px;
}

.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border-left: 4px solid;
}

.toast.info {
  border-color: #3b82f6;
  background: #eff6ff;
}

.toast.warning {
  border-color: #f59e0b;
  background: #fffbeb;
}

.toast.error {
  border-color: #ef4444;
  background: #fef2f2;
}

.icon {
  font-size: 18px;
  flex-shrink: 0;
}

.message {
  flex: 1;
  font-size: 14px;
  color: #1e293b;
  line-height: 1.4;
}

.close {
  background: none;
  border: none;
  font-size: 20px;
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  flex-shrink: 0;
}

.close:hover {
  color: #64748b;
}

/* 动画 */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
