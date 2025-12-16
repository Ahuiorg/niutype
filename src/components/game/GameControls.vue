<template>
  <div class="game-controls">
    <!-- 桌面端：键盘控制提示 -->
    <div v-if="!isMobile" class="keyboard-hint">
      🎮 使用方向键控制移动
    </div>
    
    <!-- 移动端：触摸控制按钮 -->
    <div v-else class="touch-controls">
      <!-- 暂停/开始按钮 -->
      <button
        class="control-btn start-btn"
        @touchstart.prevent="handleTogglePause"
        @mousedown.prevent="handleTogglePause"
      >
        {{ isPaused ? '▶️' : '⏸️' }}
      </button>
      
      <div class="direction-controls">
        <div class="control-row">
          <button
            class="control-btn direction-btn"
            :disabled="disabled"
            @touchstart.prevent="handleDirection('up')"
            @mousedown.prevent="handleDirection('up')"
          >
            ⬆️
          </button>
        </div>
        <div class="control-row">
          <button
            class="control-btn direction-btn"
            :disabled="disabled"
            @touchstart.prevent="handleDirection('left')"
            @mousedown.prevent="handleDirection('left')"
          >
            ⬅️
          </button>
          <button
            class="control-btn direction-btn"
            :disabled="disabled"
            @touchstart.prevent="handleDirection('down')"
            @mousedown.prevent="handleDirection('down')"
          >
            ⬇️
          </button>
          <button
            class="control-btn direction-btn"
            :disabled="disabled"
            @touchstart.prevent="handleDirection('right')"
            @mousedown.prevent="handleDirection('right')"
          >
            ➡️
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { Direction } from '@/types'

interface Props {
  disabled?: boolean
  isPaused?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  isPaused: true,
})

const emit = defineEmits<{
  direction: [direction: Direction]
  togglePause: []
}>()

const isMobile = ref(false)

const handleDirection = (direction: Direction) => {
  if (props.disabled) return
  emit('direction', direction)
}

const handleTogglePause = () => {
  emit('togglePause')
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
  margin-top: 16px;
}

.keyboard-hint {
  text-align: center;
  font-family: var(--font-body, 'Quicksand', sans-serif);
  color: var(--color-text-secondary, #7F8C8D);
  font-size: 14px;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 100px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.touch-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.direction-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.control-row {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.control-btn {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%);
  border: 3px solid transparent;
  background-clip: padding-box;
  border-radius: 16px;
  color: var(--color-text-primary, #2C3E50);
  font-size: 24px;
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.1),
    0 2px 4px rgba(0, 0, 0, 0.05),
    inset 0 -3px 0 rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn::before {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 18px;
  background: linear-gradient(135deg, #FF6B9D, #FF9F43, #FECA57, #5CD859, #54A0FF, #9C88FF);
  z-index: -1;
}

.direction-btn {
  position: relative;
}

.start-btn {
  width: 80px;
  height: 50px;
  background: linear-gradient(135deg, #5CD859 0%, #54A0FF 100%);
  color: white;
  font-size: 20px;
  border-radius: 100px;
  box-shadow: 
    0 4px 16px rgba(92, 216, 89, 0.3),
    0 2px 4px rgba(0, 0, 0, 0.1),
    inset 0 -3px 0 rgba(0, 0, 0, 0.15);
}

.start-btn::before {
  display: none;
}

.control-btn:active:not(:disabled) {
  transform: translateY(2px) scale(0.95);
  box-shadow: 
    0 2px 6px rgba(0, 0, 0, 0.1),
    0 1px 2px rgba(0, 0, 0, 0.05),
    inset 0 -1px 0 rgba(0, 0, 0, 0.08);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .control-btn {
    width: 54px;
    height: 54px;
    font-size: 20px;
    border-radius: 14px;
  }
  
  .start-btn {
    width: 70px;
    height: 45px;
    font-size: 18px;
  }
}
</style>
