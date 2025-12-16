<template>
  <div class="snake-game-page">
    <div class="game-container">
      <div class="game-header">
        <button class="exit-btn" @click="handleExit">
          <span class="exit-icon">←</span>
          退出
        </button>
        <div class="title-score-row">
          <h1 class="game-title">🐍 字母贪吃蛇</h1>
        </div>
        <div class="header-spacer">
          <GameScore :score="gameState.score" />
        </div>
      </div>
      
      <div class="game-area">
        <SnakeGameCanvas
          :game-state="gameState"
          :config="gameConfig"
        />
        <div v-if="gameState.isPaused && !gameState.isGameOver" class="pause-overlay">
          <div class="pause-message">
            <div class="pause-snake">🐍</div>
            <p class="pause-title">准备好了吗？</p>
            <p class="pause-hint">按 <span class="key-hint">空格键</span> 开始</p>
            <button class="start-game-btn" @click="togglePause">
              ▶ 开始游戏
            </button>
          </div>
        </div>
      </div>

      <GameControls
        :disabled="gameState.isGameOver"
        :is-paused="gameState.isPaused"
        @direction="handleDirection"
        @toggle-pause="togglePause"
      />

      <div class="game-instructions">
        <p>🎮 使用 <strong>方向键</strong> 控制小蛇移动</p>
        <p>⏯️ 按 <strong>空格键</strong> 开始/暂停游戏</p>
        <p>🍎 吃掉字母学习单词，收集更多分数！</p>
      </div>
    </div>

    <GameOverModal
      :visible="gameState.isGameOver && !showChallengeSuccess"
      :score="gameState.score"
      @restart="handleRestart"
    />
    
    <ChallengeSuccessModal
      :visible="showChallengeSuccess"
      :score="gameState.score"
      :target-length="CHALLENGE_SUCCESS_LENGTH"
      @restart="handleRestart"
      @exit="handleExit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import type { SnakeGameState, SnakeGameConfig, Direction } from '@/types'
import {
  moveSnake,
  changeDirection,
  initSnakeGameWithWords,
  resetGameWithWords,
  DEFAULT_SNAKE_CONFIG,
  CHALLENGE_SUCCESS_LENGTH,
  getMoveSpeedByLength,
} from '@/utils/snakeGame'
import SnakeGameCanvas from '@/components/game/SnakeGameCanvas.vue'
import GameScore from '@/components/game/GameScore.vue'
import GameControls from '@/components/game/GameControls.vue'
import GameOverModal from '@/components/game/GameOverModal.vue'
import ChallengeSuccessModal from '@/components/game/ChallengeSuccessModal.vue'

const router = useRouter()
const gameStore = useGameStore()

// 单词库
const wordList = ref<string[]>([])

// 响应式游戏配置
const gameConfig = computed<SnakeGameConfig>(() => {
  // 根据屏幕大小动态计算 gridSize
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 800
  const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 600
  
  // 移动端使用较小的网格
  const isMobile = screenWidth < 768
  const gridCount = isMobile ? 12 : 15
  
  // 计算可用空间
  const maxWidth = Math.min(screenWidth - 40, 600)
  const maxHeight = Math.min(screenHeight - 280, 600)
  const availableSize = Math.min(maxWidth, maxHeight)
  
  const gridSize = Math.floor(availableSize / gridCount)
  
  return {
    ...DEFAULT_SNAKE_CONFIG,
    gridSize: Math.max(gridSize, 25), // 最小 25px
    gridWidth: gridCount,
    gridHeight: gridCount,
  }
})

const gameState = ref<SnakeGameState>({
  snake: [],
  food: null,
  direction: 'right',
  nextDirection: null,
  score: 0,
  isGameOver: false,
  isPaused: true,
})

let gameInterval: number | null = null
const showChallengeSuccess = ref(false)

// 加载单词库
const loadWordList = async () => {
  try {
    const data = await import('@/assets/wordList.json')
    wordList.value = data.words || []
  } catch (error) {
    console.error('Failed to load word list:', error)
    // 使用备用单词
    wordList.value = ['HELLO', 'WORLD', 'APPLE', 'SNAKE', 'GAME']
  }
}

// 初始化游戏
const initGame = async () => {
  await loadWordList()
  
  const newState = initSnakeGameWithWords(wordList.value, gameConfig.value)
  gameState.value = newState
  
  // 检查是否可以开始游戏
  if (!gameStore.canPlay) {
    router.push('/games')
    return
  }
}

// 开始游戏循环
const startGameLoop = () => {
  if (gameInterval) {
    clearTimeout(gameInterval)
    gameInterval = null
  }
  
  const gameLoop = () => {
    if (gameState.value.isGameOver || gameState.value.isPaused) {
      return
    }
    
    gameState.value = moveSnake(gameState.value, gameConfig.value)
    
    // 检查是否达到挑战成功长度
    if (gameState.value.snake.length >= CHALLENGE_SUCCESS_LENGTH) {
      showChallengeSuccess.value = true
      pauseGame()
      return
    }
    
    // 检查游戏时间
    gameStore.updateGameTime()
    if (!gameStore.canPlay) {
      // 时间用完，暂停游戏
      pauseGame()
      return
    }
    
    // 根据当前蛇的长度动态调整速度，继续循环
    const currentSpeed = getMoveSpeedByLength(gameState.value.snake.length)
    gameInterval = window.setTimeout(gameLoop, currentSpeed)
  }
  
  // 启动游戏循环
  const currentSpeed = getMoveSpeedByLength(gameState.value.snake.length)
  gameInterval = window.setTimeout(gameLoop, currentSpeed)
}

// 暂停游戏
const pauseGame = () => {
  if (gameInterval) {
    clearTimeout(gameInterval)
    gameInterval = null
  }
  gameState.value.isPaused = true
  gameStore.pauseGame()
}

// 继续/开始游戏
const resumeGame = () => {
  if (gameState.value.isGameOver) return
  
  if (!gameStore.canPlay) {
    router.push('/games')
    return
  }
  
  // 如果游戏还没开始，先启动游戏
  if (!gameStore.gameState.isPlaying) {
    gameStore.startGame('snake')
  } else {
    gameStore.resumeGame()
  }
  
  gameState.value.isPaused = false
  startGameLoop()
}

// 切换暂停/继续
const togglePause = () => {
  if (gameState.value.isGameOver) return
  
  if (gameState.value.isPaused) {
    resumeGame()
  } else {
    pauseGame()
  }
}

// 退出游戏
const handleExit = () => {
  if (gameInterval) {
    clearInterval(gameInterval)
    gameInterval = null
  }
  gameStore.stopGame()
  router.push('/games')
}

// 处理方向改变
const handleDirection = (direction: Direction) => {
  if (gameState.value.isGameOver || gameState.value.isPaused) {
    return
  }
  gameState.value = changeDirection(gameState.value, direction)
}

// 处理键盘事件
const handleKeyDown = (event: KeyboardEvent) => {
  // 空格键：开始/暂停
  if (event.code === 'Space') {
    event.preventDefault()
    togglePause()
    return
  }
  
  // ESC键：退出游戏
  if (event.key === 'Escape') {
    event.preventDefault()
    handleExit()
    return
  }
}

// 重新开始游戏
const handleRestart = () => {
  if (gameInterval) {
    clearTimeout(gameInterval)
    gameInterval = null
  }
  
  showChallengeSuccess.value = false
  gameState.value = resetGameWithWords(wordList.value, gameConfig.value)
  // 重置后保持暂停状态，等待用户按空格开始
  gameState.value.isPaused = true
}

// 监听窗口大小变化
const handleResize = () => {
  // 触发重新计算 gameConfig
  // computed 会自动响应
}

onMounted(() => {
  gameStore.checkAndResetDay()
  initGame()
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('resize', handleResize)
  if (gameInterval) {
    clearTimeout(gameInterval)
    gameInterval = null
  }
  gameStore.stopGame()
})
</script>

<style scoped>
.snake-game-page {
  min-height: 100vh;
  padding: 16px;
  background: var(--color-bg-gradient, linear-gradient(135deg, #FFF5F8 0%, #F0F8FF 50%, #FFF8F0 100%));
  color: var(--color-text-primary, #2C3E50);
  display: flex;
  justify-content: center;
  overflow: hidden;
}

.game-container {
  width: 100%;
  max-width: 700px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.game-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 4px;
}

.title-score-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.exit-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: linear-gradient(135deg, #FF6B9D 0%, #FF9F43 100%);
  border: none;
  border-radius: 100px;
  color: #FFFFFF;
  font-family: var(--font-display, 'Baloo 2', cursive);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 
    0 4px 12px rgba(255, 107, 157, 0.3),
    0 2px 0 rgba(0, 0, 0, 0.1);
}

.exit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 6px 16px rgba(255, 107, 157, 0.4),
    0 3px 0 rgba(0, 0, 0, 0.1);
}

.exit-btn:active {
  transform: translateY(1px);
  box-shadow: 
    0 2px 8px rgba(255, 107, 157, 0.3),
    0 1px 0 rgba(0, 0, 0, 0.1);
}

.exit-icon {
  font-size: 16px;
}

.game-title {
  font-family: var(--font-display, 'Baloo 2', cursive);
  font-size: 24px;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #FF6B9D 0%, #FF9F43 50%, #FECA57 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: none;
}

.game-area {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.pause-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  border-radius: 20px;
}

.pause-message {
  text-align: center;
  padding: 28px 36px;
  background: white;
  border-radius: 28px;
  box-shadow: 
    0 12px 40px rgba(255, 107, 157, 0.18),
    0 4px 16px rgba(0, 0, 0, 0.06);
  animation: pausePopIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes pausePopIn {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.pause-snake {
  font-size: 56px;
  margin-bottom: 8px;
  animation: snakeWiggle 1.5s ease-in-out infinite;
}

@keyframes snakeWiggle {
  0%, 100% {
    transform: rotate(-8deg) scale(1);
  }
  50% {
    transform: rotate(8deg) scale(1.05);
  }
}

.pause-title {
  font-family: var(--font-display, 'Baloo 2', cursive);
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #FF6B9D 0%, #FF9F43 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.pause-hint {
  font-family: var(--font-body, 'Quicksand', sans-serif);
  font-size: 14px;
  color: var(--color-text-secondary, #7F8C8D);
  margin: 0 0 16px 0;
}

.key-hint {
  display: inline-block;
  padding: 3px 10px;
  background: linear-gradient(135deg, #9C88FF 0%, #54A0FF 100%);
  color: white;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
}

.start-game-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 32px;
  background: linear-gradient(135deg, #5CD859 0%, #54A0FF 100%);
  border: none;
  border-radius: 100px;
  color: white;
  font-family: var(--font-display, 'Baloo 2', cursive);
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 
    0 6px 20px rgba(92, 216, 89, 0.35),
    0 2px 0 rgba(0, 0, 0, 0.1);
}

.start-game-btn:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 
    0 10px 28px rgba(92, 216, 89, 0.4),
    0 3px 0 rgba(0, 0, 0, 0.1);
}

.start-game-btn:active {
  transform: translateY(1px) scale(0.98);
}

.game-instructions {
  text-align: center;
  font-family: var(--font-body, 'Quicksand', sans-serif);
  font-size: 13px;
  color: var(--color-text-secondary, #7F8C8D);
  line-height: 1.8;
  padding: 0 16px;
  margin-top: 4px;
}

.game-instructions p {
  margin: 2px 0;
}

.game-instructions strong {
  color: var(--candy-orange, #FF9F43);
  font-weight: 600;
}

@media (max-width: 768px) {
  .snake-game-page {
    padding: 10px;
    align-items: flex-start;
    padding-top: 12px;
  }
  
  .game-container {
    gap: 10px;
  }
  
  .game-title {
    font-size: 18px;
  }
  
  .game-header {
    flex-direction: column;
    gap: 8px;
  }
  
  .title-score-row {
    order: -1;
    gap: 12px;
  }
  
  .exit-btn {
    position: absolute;
    top: 12px;
    left: 12px;
    padding: 8px 14px;
    font-size: 13px;
  }
  
  .header-spacer {
    display: none;
  }
  
  .pause-message {
    padding: 24px 28px;
  }
  
  .pause-snake {
    font-size: 48px;
  }
  
  .pause-title {
    font-size: 20px;
  }
  
  .pause-hint {
    font-size: 13px;
  }
  
  .start-game-btn {
    padding: 12px 28px;
    font-size: 16px;
  }
  
  .game-instructions {
    font-size: 12px;
    line-height: 1.6;
  }
}

@media (max-width: 480px) {
  .game-title {
    font-size: 16px;
  }
  
  .title-score-row {
    flex-direction: column;
    gap: 6px;
  }
  
  .pause-snake {
    font-size: 42px;
  }
  
  .start-game-btn {
    padding: 11px 24px;
    font-size: 15px;
  }
}
</style>
