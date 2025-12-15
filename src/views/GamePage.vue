<template>
  <div class="game-page">
    <div class="game-header">
      <h1 class="page-title">游戏中心</h1>
      <div class="time-info">
        <span class="time-label">剩余游戏时间</span>
        <span class="time-value">{{ formatTime(remainingTime) }}</span>
      </div>
    </div>

    <div v-if="!canPlay" class="time-limit-message">
      <p>今日游戏时间已用完</p>
      <p class="hint">明天再来吧！</p>
    </div>

    <div v-else class="game-list">
      <div class="game-card" @click="goToSnakeGame">
        <div class="game-icon">🐍</div>
        <h3 class="game-name">复古像素风贪吃蛇</h3>
        <p class="game-description">用方向键控制蛇吃字母，让蛇越来越长！</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'

const router = useRouter()
const gameStore = useGameStore()

const remainingTime = computed(() => gameStore.remainingTime)
const canPlay = computed(() => gameStore.canPlay)

const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

const goToSnakeGame = () => {
  if (canPlay.value) {
    router.push('/games/snake')
  }
}

onMounted(() => {
  gameStore.checkAndResetDay()
})
</script>

<style scoped>
.game-page {
  min-height: 100vh;
  padding: 40px 20px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #FFFFFF;
}

.game-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-family: 'Courier New', monospace;
  font-size: 36px;
  font-weight: bold;
  margin: 0 0 20px 0;
  text-transform: uppercase;
  letter-spacing: 3px;
  background: linear-gradient(135deg, #FFD700, #FF6B6B);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.time-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 15px 30px;
  background: rgba(26, 26, 46, 0.6);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  display: inline-block;
}

.time-label {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.time-value {
  font-family: 'Courier New', monospace;
  font-size: 24px;
  font-weight: bold;
  color: #FFD700;
}

.time-limit-message {
  text-align: center;
  padding: 60px 20px;
  background: rgba(26, 26, 46, 0.6);
  border: 2px solid rgba(255, 107, 107, 0.3);
  border-radius: 12px;
  max-width: 500px;
  margin: 0 auto;
}

.time-limit-message p {
  font-family: 'Courier New', monospace;
  font-size: 18px;
  margin: 10px 0;
}

.hint {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.game-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.game-card {
  background: rgba(26, 26, 46, 0.8);
  border: 3px solid;
  border-image: linear-gradient(135deg, #4A90D9, #6BA3E0) 1;
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.game-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(74, 144, 217, 0.3);
  border-image: linear-gradient(135deg, #6BA3E0, #8BC5F0) 1;
}

.game-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.game-name {
  font-family: 'Courier New', monospace;
  font-size: 20px;
  font-weight: bold;
  margin: 0 0 15px 0;
  color: #FFFFFF;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.game-description {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  margin: 0;
}
</style>
