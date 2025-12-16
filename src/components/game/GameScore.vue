<template>
  <div class="game-score" :class="{ 'score-updated': scoreUpdated }">
    <span class="score-icon">⭐</span>
    <div class="score-content">
      <span class="score-label">分数</span>
      <span class="score-value">{{ score }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  score: number
}

const props = defineProps<Props>()
const scoreUpdated = ref(false)

watch(() => props.score, () => {
  scoreUpdated.value = true
  setTimeout(() => {
    scoreUpdated.value = false
  }, 300)
})
</script>

<style scoped>
.game-score {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: white;
  border-radius: 100px;
  box-shadow: 
    0 4px 12px rgba(255, 159, 67, 0.15),
    0 2px 0 rgba(0, 0, 0, 0.08);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.score-icon {
  font-size: 16px;
  animation: starPulse 2s ease-in-out infinite;
}

@keyframes starPulse {
  0%, 100% {
    transform: scale(1) rotate(0deg);
  }
  50% {
    transform: scale(1.1) rotate(10deg);
  }
}

.score-content {
  display: flex;
  align-items: center;
  gap: 2px;
}

.score-label {
  font-family: var(--font-body, 'Quicksand', sans-serif);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary, #7F8C8D);
}

.score-value {
  font-family: var(--font-display, 'Baloo 2', cursive);
  font-size: 16px;
  font-weight: 700;
  line-height: 1;
  background: linear-gradient(135deg, #FF9F43 0%, #FF6B9D 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.score-updated {
  transform: scale(1.05);
}

.score-updated .score-value {
  animation: scorePop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.score-updated .score-icon {
  animation: starBounce 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes scorePop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes starBounce {
  0% {
    transform: scale(1) rotate(0deg);
  }
  50% {
    transform: scale(1.4) rotate(20deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}

@media (max-width: 768px) {
  .game-score {
    padding: 8px 14px;
    gap: 5px;
  }
  
  .score-icon {
    font-size: 14px;
  }
  
  .score-label {
    font-size: 11px;
  }
  
  .score-value {
    font-size: 14px;
  }
}
</style>
