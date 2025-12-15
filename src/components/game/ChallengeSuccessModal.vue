<template>
  <div v-if="visible" class="challenge-success-modal" @click.self="handleBackdropClick">
    <div class="modal-content">
      <h2 class="success-title">🎉 挑战成功！</h2>
      <div class="success-message">
        <p>恭喜你！蛇的长度达到了 {{ targetLength }} 格！</p>
        <p class="final-score-text">最终分数：<span class="score-value">{{ score }}</span></p>
      </div>
      <div class="button-group">
        <button class="restart-btn" @click="handleRestart">
          重新开始
        </button>
        <button class="exit-btn" @click="handleExit">
          返回游戏列表
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  visible: boolean
  score: number
  targetLength: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  restart: []
  exit: []
}>()

const handleRestart = () => {
  emit('restart')
}

const handleExit = () => {
  emit('exit')
}

const handleBackdropClick = () => {
  // 点击背景不关闭
}
</script>

<style scoped>
.challenge-success-modal {
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
  border-image: linear-gradient(135deg, #FFD700, #34C759) 1;
  padding: 40px;
  border-radius: 12px;
  text-align: center;
  min-width: 350px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.success-title {
  font-family: 'Courier New', monospace;
  font-size: 36px;
  font-weight: bold;
  background: linear-gradient(135deg, #FFD700, #34C759);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 20px 0;
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

.success-message {
  margin-bottom: 30px;
}

.success-message p {
  font-family: 'Courier New', monospace;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  margin: 10px 0;
  line-height: 1.6;
}

.final-score-text {
  font-size: 18px;
  margin-top: 15px;
}

.score-value {
  color: #FFD700;
  font-weight: bold;
  font-size: 24px;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.button-group {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.restart-btn,
.exit-btn {
  padding: 15px 30px;
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

.restart-btn {
  background: linear-gradient(135deg, #4A90D9, #6BA3E0);
}

.restart-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 5px 20px rgba(74, 144, 217, 0.5);
  border-color: rgba(255, 255, 255, 0.5);
}

.exit-btn {
  background: linear-gradient(135deg, #FF6B6B, #E74C3C);
}

.exit-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 5px 20px rgba(255, 107, 107, 0.5);
  border-color: rgba(255, 255, 255, 0.5);
}

.restart-btn:active,
.exit-btn:active {
  transform: scale(1.05);
}
</style>
