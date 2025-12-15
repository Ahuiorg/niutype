<template>
  <div v-if="visible" class="game-over-modal" @click.self="handleBackdropClick">
    <div class="modal-content">
      <h2 class="game-over-title">游戏结束</h2>
      <div class="final-score">
        <span class="score-label">最终分数</span>
        <span class="score-value">{{ score }}</span>
      </div>
      <button class="restart-btn" @click="handleRestart">
        重新开始
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  visible: boolean
  score: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  restart: []
}>()

const handleRestart = () => {
  emit('restart')
}

const handleBackdropClick = () => {
  // 点击背景不关闭，必须点击重新开始
}
</script>

<style scoped>
.game-over-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  border: 3px solid;
  border-image: linear-gradient(135deg, #FFD700, #FF6B6B) 1;
  padding: 40px;
  border-radius: 12px;
  text-align: center;
  min-width: 300px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.game-over-title {
  font-family: 'Courier New', monospace;
  font-size: 32px;
  font-weight: bold;
  background: linear-gradient(135deg, #FFD700, #FF6B6B);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 30px 0;
  text-transform: uppercase;
  letter-spacing: 3px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
}

.final-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-bottom: 30px;
}

.score-label {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 2px;
}

.score-value {
  font-family: 'Courier New', monospace;
  font-size: 48px;
  font-weight: bold;
  color: #FFD700;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
}

.restart-btn {
  padding: 15px 40px;
  background: linear-gradient(135deg, #4A90D9, #6BA3E0);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: #FFFFFF;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.restart-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 5px 20px rgba(74, 144, 217, 0.5);
  border-color: rgba(255, 255, 255, 0.5);
}

.restart-btn:active {
  transform: scale(1.05);
}
</style>
