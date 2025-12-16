<template>
  <div class="game-page">
    <!-- 装饰性背景元素 -->
    <div class="decorations">
      <span class="deco deco-1">⭐</span>
      <span class="deco deco-2">🌸</span>
      <span class="deco deco-3">💫</span>
      <span class="deco deco-4">🎈</span>
      <span class="deco deco-5">✨</span>
      <span class="deco deco-6">🍬</span>
      <span class="deco deco-7">🌈</span>
      <span class="deco deco-8">🎀</span>
    </div>

    <div class="game-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">
          <CuteIcons name="game" :size="36" class="title-icon" />
          游戏乐园
        </h1>
        <p class="page-subtitle">选择你喜欢的游戏开始冒险吧！</p>
      </div>

      <!-- 时间信息卡片 -->
      <div class="time-card">
        <CuteIcons name="clock" :size="36" class="time-icon" />
        <div class="time-content">
          <span class="time-label">今日剩余游戏时间</span>
          <div class="time-display">
            <span class="time-value">{{ formatTime(remainingTime) }}</span>
          </div>
        </div>
        <div class="time-progress">
          <div class="progress-bar" :style="{ width: progressPercent + '%' }"></div>
        </div>
      </div>

      <!-- 时间用完提示 -->
      <div v-if="!canPlay" class="time-limit-message">
        <div class="limit-icon">😴</div>
        <h3 class="limit-title">今日游戏时间已用完</h3>
        <p class="limit-hint">休息一下，明天再来玩吧！</p>
        <div class="limit-stars">⭐ ⭐ ⭐</div>
      </div>

      <!-- 游戏列表 -->
      <div v-else class="game-list">
        <div class="game-card" @click="goToSnakeGame">
          <div class="card-glow"></div>
          <div class="card-content">
            <div class="game-badge">热门</div>
            <div class="game-icon-wrapper">
              <span class="game-icon">🐍</span>
              <span class="icon-ring"></span>
            </div>
            <h3 class="game-name">字母贪吃蛇</h3>
            <p class="game-description">控制小蛇收集字母，学习英语单词！</p>
            <div class="play-button">
              <span class="play-icon">▶</span>
              <span class="play-text">开始游戏</span>
            </div>
          </div>
        </div>

        <!-- 更多游戏占位 - 敬请期待 -->
        <div class="game-card coming-soon">
          <div class="card-content">
            <div class="game-icon-wrapper">
              <span class="game-icon">🎯</span>
              <span class="icon-ring muted"></span>
            </div>
            <h3 class="game-name">更多游戏</h3>
            <p class="game-description">精彩游戏即将上线，敬请期待！</p>
            <div class="coming-badge">即将推出</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import CuteIcons from '@/components/icons/CuteIcons.vue'

const router = useRouter()
const gameStore = useGameStore()

const remainingTime = computed(() => gameStore.remainingTime)
const canPlay = computed(() => gameStore.canPlay)

// 计算进度百分比 (假设每日30分钟)
const progressPercent = computed(() => {
  const totalTime = 30 * 60 * 1000 // 30分钟
  return Math.min(100, (remainingTime.value / totalTime) * 100)
})

const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')} : ${seconds.toString().padStart(2, '0')}`
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
/* 页面容器 */
.game-page {
  min-height: 100vh;
  padding: 24px 20px;
  background: linear-gradient(135deg, #FFF5F8 0%, #F0F8FF 50%, #FFF8F0 100%);
  position: relative;
  overflow: hidden;
}

/* 装饰元素容器 */
.decorations {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.deco {
  position: absolute;
  font-size: 24px;
  opacity: 0.6;
  animation: float 6s ease-in-out infinite;
}

.deco-1 { top: 8%; left: 5%; animation-delay: 0s; font-size: 28px; }
.deco-2 { top: 15%; right: 8%; animation-delay: 1s; font-size: 22px; }
.deco-3 { top: 35%; left: 3%; animation-delay: 2s; font-size: 20px; }
.deco-4 { top: 50%; right: 5%; animation-delay: 0.5s; font-size: 26px; }
.deco-5 { bottom: 30%; left: 8%; animation-delay: 1.5s; font-size: 24px; }
.deco-6 { bottom: 20%; right: 10%; animation-delay: 2.5s; font-size: 22px; }
.deco-7 { bottom: 10%; left: 15%; animation-delay: 3s; font-size: 28px; }
.deco-8 { top: 70%; right: 3%; animation-delay: 3.5s; font-size: 20px; }

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(5deg); }
}

/* 内容容器 */
.game-container {
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

/* 页面标题区域 */
.page-header {
  text-align: center;
  margin-bottom: 28px;
}

.page-title {
  font-family: var(--font-display, 'Baloo 2', cursive);
  font-size: 42px;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #FF6B9D 0%, #FF9F43 50%, #FECA57 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.title-icon {
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.page-subtitle {
  font-family: var(--font-body, 'Quicksand', sans-serif);
  font-size: 16px;
  color: #7F8C8D;
  margin: 8px 0 0 0;
  font-weight: 500;
}

/* 时间卡片 */
.time-card {
  background: white;
  border-radius: 20px;
  padding: 20px 28px;
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 
    0 8px 32px rgba(255, 107, 157, 0.12),
    0 4px 12px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
}

.time-icon {
  animation: swing 2s ease-in-out infinite;
}

@keyframes swing {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}

.time-content {
  flex: 1;
}

.time-label {
  font-family: var(--font-body, 'Quicksand', sans-serif);
  font-size: 13px;
  color: #95A5A6;
  font-weight: 600;
  display: block;
  margin-bottom: 4px;
}

.time-display {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.time-value {
  font-family: var(--font-display, 'Baloo 2', cursive);
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #FF6B9D 0%, #FF9F43 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 2px;
}

.time-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(255, 107, 157, 0.1);
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #FF6B9D, #FF9F43, #FECA57);
  border-radius: 0 2px 2px 0;
  transition: width 0.5s ease;
}

/* 时间用完提示 */
.time-limit-message {
  text-align: center;
  padding: 48px 32px;
  background: white;
  border-radius: 24px;
  box-shadow: 
    0 8px 32px rgba(255, 107, 157, 0.12),
    0 4px 12px rgba(0, 0, 0, 0.06);
}

.limit-icon {
  font-size: 64px;
  margin-bottom: 16px;
  animation: sleepy 3s ease-in-out infinite;
}

@keyframes sleepy {
  0%, 100% { transform: rotate(-3deg) scale(1); }
  50% { transform: rotate(3deg) scale(1.05); }
}

.limit-title {
  font-family: var(--font-display, 'Baloo 2', cursive);
  font-size: 24px;
  font-weight: 700;
  color: #2C3E50;
  margin: 0 0 8px 0;
}

.limit-hint {
  font-family: var(--font-body, 'Quicksand', sans-serif);
  font-size: 15px;
  color: #7F8C8D;
  margin: 0 0 16px 0;
}

.limit-stars {
  font-size: 20px;
  letter-spacing: 8px;
  opacity: 0.6;
}

/* 游戏列表 */
.game-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

/* 游戏卡片 */
.game-card {
  background: white;
  border-radius: 24px;
  padding: 28px;
  text-align: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 
    0 8px 32px rgba(255, 107, 157, 0.1),
    0 4px 12px rgba(0, 0, 0, 0.05);
}

.card-glow {
  position: absolute;
  inset: -2px;
  background: linear-gradient(135deg, #FF6B9D, #FF9F43, #FECA57, #A8E6CF);
  border-radius: 26px;
  opacity: 0;
  z-index: -1;
  transition: opacity 0.3s ease;
}

.game-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 
    0 16px 48px rgba(255, 107, 157, 0.2),
    0 8px 24px rgba(0, 0, 0, 0.08);
}

.game-card:hover .card-glow {
  opacity: 1;
}

.game-card:active {
  transform: translateY(-4px) scale(1.01);
}

.card-content {
  position: relative;
  background: white;
  border-radius: 22px;
  padding: 4px;
}

/* 热门标签 */
.game-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: linear-gradient(135deg, #FF6B9D, #FF9F43);
  color: white;
  font-family: var(--font-body, 'Quicksand', sans-serif);
  font-size: 11px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 100px;
  box-shadow: 0 4px 12px rgba(255, 107, 157, 0.3);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* 游戏图标 */
.game-icon-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 16px;
}

.game-icon {
  font-size: 56px;
  display: block;
  position: relative;
  z-index: 1;
  animation: wiggle 3s ease-in-out infinite;
}

@keyframes wiggle {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}

.icon-ring {
  position: absolute;
  inset: -12px;
  border: 3px dashed rgba(255, 107, 157, 0.3);
  border-radius: 50%;
  animation: spin 12s linear infinite;
}

.icon-ring.muted {
  border-color: rgba(149, 165, 166, 0.2);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.game-name {
  font-family: var(--font-display, 'Baloo 2', cursive);
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #2C3E50;
}

.game-description {
  font-family: var(--font-body, 'Quicksand', sans-serif);
  font-size: 14px;
  color: #7F8C8D;
  line-height: 1.5;
  margin: 0 0 20px 0;
}

/* 开始游戏按钮 */
.play-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  background: linear-gradient(135deg, #FF6B9D 0%, #FF9F43 100%);
  border-radius: 100px;
  color: white;
  font-family: var(--font-display, 'Baloo 2', cursive);
  font-size: 15px;
  font-weight: 600;
  box-shadow: 
    0 4px 16px rgba(255, 107, 157, 0.3),
    0 2px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.game-card:hover .play-button {
  transform: scale(1.05);
  box-shadow: 
    0 6px 20px rgba(255, 107, 157, 0.4),
    0 3px 0 rgba(0, 0, 0, 0.1);
}

.play-icon {
  font-size: 12px;
}

/* 敬请期待卡片 */
.coming-soon {
  cursor: default;
  opacity: 0.7;
}

.coming-soon:hover {
  transform: none;
  box-shadow: 
    0 8px 32px rgba(255, 107, 157, 0.1),
    0 4px 12px rgba(0, 0, 0, 0.05);
}

.coming-soon .game-icon {
  filter: grayscale(0.5);
  animation: none;
}

.coming-soon .game-name {
  color: #95A5A6;
}

.coming-badge {
  display: inline-block;
  padding: 8px 20px;
  background: rgba(149, 165, 166, 0.15);
  border-radius: 100px;
  color: #95A5A6;
  font-family: var(--font-body, 'Quicksand', sans-serif);
  font-size: 13px;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .game-page {
    padding: 20px 16px;
  }
  
  .page-title {
    font-size: 32px;
  }
  
  .title-icon {
    font-size: 28px;
  }
  
  .page-subtitle {
    font-size: 14px;
  }
  
  .time-card {
    padding: 16px 20px;
    flex-wrap: wrap;
  }
  
  .time-icon {
    font-size: 28px;
  }
  
  .time-value {
    font-size: 26px;
  }
  
  .game-list {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .game-card {
    padding: 24px;
  }
  
  .game-icon {
    font-size: 48px;
  }
  
  .game-name {
    font-size: 20px;
  }
  
  .deco {
    font-size: 18px;
  }
  
  .deco-1, .deco-7 { font-size: 22px; }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 28px;
    flex-direction: column;
    gap: 8px;
  }
  
  .time-card {
    flex-direction: column;
    text-align: center;
  }
  
  .time-content {
    width: 100%;
  }
  
  .time-value {
    font-size: 28px;
  }
}
</style>
