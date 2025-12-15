<template>
  <div class="game-controls">
    <!-- 桌面端：键盘控制提示 -->
    <div v-if="!isMobile" class="keyboard-hint">
      使用方向键控制
    </div>
    
    <!-- 移动端：触摸控制按钮 -->
    <div v-else class="touch-controls">
      <div class="control-row">
        <button
          class="control-btn"
          @touchstart.prevent="handleDirection('up')"
          @mousedown.prevent="handleDirection('up')"
        >
          ↑
        </button>
      </div>
      <div class="control-row">
        <button
          class="control-btn"
          @touchstart.prevent="handleDirection('left')"
          @mousedown.prevent="handleDirection('left')"
        >
          ←
        </button>
        <button
          class="control-btn"
          @touchstart.prevent="handleDirection('down')"
          @mousedown.prevent="handleDirection('down')"
        >
          ↓
        </button>
        <button
          class="control-btn"
          @touchstart.prevent="handleDirection('right')"
          @mousedown.prevent="handleDirection('right')"
        >
          →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { Direction } from '@/types'

interface Props {
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<{
  direction: [direction: Direction]
}>()

const isMobile = ref(false)

const handleDirection = (direction: Direction) => {
  if (props.disabled) return
  emit('direction', direction)
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (props.disabled) return
  
  let direction: Direction | null = null
  
  switch (event.key) {
    case 'ArrowUp':
      direction = 'up'
      break
    case 'ArrowDown':
      direction = 'down'
      break
    case 'ArrowLeft':
      direction = 'left'
      break
    case 'ArrowRight':
      direction = 'right'
      break
  }
  
  if (direction) {
    event.preventDefault()
    emit('direction', direction)
  }
}

const checkMobile = () => {
  isMobile.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || window.innerWidth < 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
.game-controls {
  margin-top: 20px;
}

.keyboard-hint {
  text-align: center;
  font-family: 'Courier New', monospace;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.touch-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.control-row {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.control-btn {
  width: 60px;
  height: 60px;
  background: rgba(26, 26, 46, 0.8);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: #FFFFFF;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
  transition: all 0.2s ease;
  font-family: 'Courier New', monospace;
}

.control-btn:active {
  background: rgba(106, 76, 147, 0.8);
  transform: scale(0.95);
  border-color: rgba(255, 255, 255, 0.5);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
