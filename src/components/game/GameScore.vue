<template>
  <div class="game-score" :class="{ 'score-updated': scoreUpdated }">
    <span class="score-label">分数</span>
    <span class="score-value">{{ score }}</span>
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
  padding: 12px 20px;
  background: rgba(26, 26, 46, 0.8);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  color: #FFFFFF;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.score-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.score-value {
  font-size: 24px;
  font-weight: bold;
  color: #FFD700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.score-updated .score-value {
  animation: scorePulse 0.3s ease;
}

@keyframes scorePulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}
</style>
