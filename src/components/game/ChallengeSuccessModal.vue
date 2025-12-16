<template>
  <Teleport to="body">
    <div v-if="visible" class="challenge-success-modal" @click.self="handleBackdropClick">
      <div class="modal-content">
        <div class="confetti-container">
          <span v-for="i in 12" :key="i" class="confetti" :style="{ '--i': i }">🎉</span>
        </div>
        <div class="modal-icon">🏆</div>
        <h2 class="success-title">挑战成功！</h2>
        <div class="success-message">
          <p>太棒了！你的小蛇长到了 <strong>{{ targetLength }}</strong> 格！</p>
        </div>
        <div class="final-score">
          <span class="score-label">最终分数</span>
          <div class="score-value-wrapper">
            <span class="score-icon">⭐</span>
            <span class="score-value">{{ score }}</span>
          </div>
        </div>
        <div class="button-group">
          <button class="restart-btn" @click="handleRestart">
            🔄 再玩一次
          </button>
          <button class="exit-btn" @click="handleExit">
            🏠 返回
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  visible: boolean
  score: number
  targetLength: number
}

defineProps<Props>()

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
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
  overflow: hidden;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.confetti {
  position: absolute;
  font-size: 24px;
  animation: confettiFall 3s ease-in-out infinite;
  animation-delay: calc(var(--i) * 0.2s);
  left: calc(var(--i) * 8%);
  top: -50px;
}

@keyframes confettiFall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

.modal-content {
  background: white;
  padding: 40px 50px;
  border-radius: 32px;
  text-align: center;
  min-width: 360px;
  box-shadow: 
    0 20px 60px rgba(92, 216, 89, 0.2),
    0 8px 24px rgba(0, 0, 0, 0.1);
  animation: modalPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  z-index: 1;
}

@keyframes modalPop {
  0% {
    opacity: 0;
    transform: scale(0.5) translateY(40px);
  }
  60% {
    transform: scale(1.05) translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-icon {
  font-size: 72px;
  margin-bottom: 16px;
  animation: trophyBounce 1s ease-in-out infinite;
}

@keyframes trophyBounce {
  0%, 100% {
    transform: translateY(0) rotate(-5deg);
  }
  50% {
    transform: translateY(-15px) rotate(5deg);
  }
}

.success-title {
  font-family: var(--font-display, 'Baloo 2', cursive);
  font-size: 36px;
  font-weight: 800;
  background: linear-gradient(135deg, #5CD859 0%, #54A0FF 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 16px 0;
}

.success-message {
  margin-bottom: 20px;
}

.success-message p {
  font-family: var(--font-body, 'Quicksand', sans-serif);
  font-size: 16px;
  color: var(--color-text-secondary, #7F8C8D);
  margin: 0;
  line-height: 1.6;
}

.success-message strong {
  color: var(--candy-green, #5CD859);
  font-weight: 700;
  font-size: 20px;
}

.final-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 28px;
  padding: 16px 28px;
  background: linear-gradient(135deg, #F0FFF0 0%, #F0F8FF 100%);
  border-radius: 20px;
}

.score-label {
  font-family: var(--font-body, 'Quicksand', sans-serif);
  font-size: 13px;
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
  font-size: 28px;
  animation: starSpin 2s ease-in-out infinite;
}

@keyframes starSpin {
  0%, 100% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(1.2);
  }
}

.score-value {
  font-family: var(--font-display, 'Baloo 2', cursive);
  font-size: 42px;
  font-weight: 800;
  background: linear-gradient(135deg, #FF9F43 0%, #FECA57 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.button-group {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.restart-btn,
.exit-btn {
  padding: 14px 28px;
  border: none;
  border-radius: 100px;
  color: #FFFFFF;
  font-family: var(--font-display, 'Baloo 2', cursive);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.restart-btn {
  background: linear-gradient(135deg, #54A0FF 0%, #5CD859 100%);
  box-shadow: 
    0 4px 16px rgba(84, 160, 255, 0.3),
    0 2px 0 rgba(0, 0, 0, 0.1);
}

.restart-btn:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 
    0 8px 24px rgba(84, 160, 255, 0.4),
    0 3px 0 rgba(0, 0, 0, 0.1);
}

.exit-btn {
  background: linear-gradient(135deg, #FF6B9D 0%, #FF9F43 100%);
  box-shadow: 
    0 4px 16px rgba(255, 107, 157, 0.3),
    0 2px 0 rgba(0, 0, 0, 0.1);
}

.exit-btn:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 
    0 8px 24px rgba(255, 107, 157, 0.4),
    0 3px 0 rgba(0, 0, 0, 0.1);
}

.restart-btn:active,
.exit-btn:active {
  transform: translateY(0) scale(0.98);
}

@media (max-width: 480px) {
  .modal-content {
    padding: 32px 24px;
    min-width: 300px;
    margin: 0 16px;
  }
  
  .modal-icon {
    font-size: 56px;
  }
  
  .success-title {
    font-size: 28px;
  }
  
  .score-value {
    font-size: 36px;
  }
  
  .button-group {
    flex-direction: column;
    gap: 10px;
  }
  
  .restart-btn,
  .exit-btn {
    width: 100%;
    padding: 14px 24px;
    font-size: 15px;
  }
}
</style>
