<template>
  <Teleport to="body">
    <div v-if="visible" class="game-over-modal" @click.self="handleBackdropClick">
      <div class="modal-content">
        <div class="modal-icon">😢</div>
        <h2 class="game-over-title">游戏结束</h2>
        <div class="final-score">
          <span class="score-label">最终分数</span>
          <div class="score-value-wrapper">
            <span class="score-icon">⭐</span>
            <span class="score-value">{{ score }}</span>
          </div>
        </div>
        <button class="restart-btn" @click="handleRestart">
          🔄 再来一次
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  visible: boolean
  score: number
}

defineProps<Props>()

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
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
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
  background: white;
  padding: 40px 50px;
  border-radius: 32px;
  text-align: center;
  min-width: 320px;
  box-shadow: 
    0 20px 60px rgba(255, 107, 157, 0.2),
    0 8px 24px rgba(0, 0, 0, 0.1);
  animation: modalPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modalPop {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-icon {
  font-size: 64px;
  margin-bottom: 16px;
  animation: iconBounce 1s ease-in-out infinite;
}

@keyframes iconBounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.game-over-title {
  font-family: var(--font-display, 'Baloo 2', cursive);
  font-size: 32px;
  font-weight: 800;
  background: linear-gradient(135deg, #FF6B9D 0%, #FF9F43 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 24px 0;
}

.final-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 32px;
  padding: 20px 32px;
  background: linear-gradient(135deg, #FFF5F8 0%, #FFF8F0 100%);
  border-radius: 20px;
}

.score-label {
  font-family: var(--font-body, 'Quicksand', sans-serif);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary, #7F8C8D);
  text-transform: uppercase;
  letter-spacing: 2px;
}

.score-value-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-icon {
  font-size: 32px;
}

.score-value {
  font-family: var(--font-display, 'Baloo 2', cursive);
  font-size: 48px;
  font-weight: 800;
  background: linear-gradient(135deg, #FF9F43 0%, #FECA57 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.restart-btn {
  padding: 16px 40px;
  background: linear-gradient(135deg, #54A0FF 0%, #5CD859 100%);
  border: none;
  border-radius: 100px;
  color: #FFFFFF;
  font-family: var(--font-display, 'Baloo 2', cursive);
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 
    0 4px 16px rgba(84, 160, 255, 0.3),
    0 2px 0 rgba(0, 0, 0, 0.1);
}

.restart-btn:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 
    0 8px 24px rgba(84, 160, 255, 0.4),
    0 4px 0 rgba(0, 0, 0, 0.1);
}

.restart-btn:active {
  transform: translateY(0) scale(0.98);
  box-shadow: 
    0 2px 8px rgba(84, 160, 255, 0.3),
    0 1px 0 rgba(0, 0, 0, 0.1);
}

@media (max-width: 480px) {
  .modal-content {
    padding: 32px 28px;
    min-width: 280px;
    margin: 0 16px;
  }
  
  .modal-icon {
    font-size: 48px;
  }
  
  .game-over-title {
    font-size: 26px;
  }
  
  .score-value {
    font-size: 40px;
  }
  
  .restart-btn {
    padding: 14px 32px;
    font-size: 16px;
  }
}
</style>
