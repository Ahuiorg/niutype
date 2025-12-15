<template>
  <div class="snake-game-page">
    <div class="game-container">
      <div class="game-header">
        <button class="exit-btn" @click="handleExit">退出游戏</button>
        <h1 class="game-title">复古像素风贪吃蛇</h1>
      </div>
      
      <div class="score-container">
        <GameScore :score="gameState.score" />
      </div>
      
      <div class="game-area">
        <SnakeGameCanvas
          :game-state="gameState"
          :config="gameConfig"
        />
        <div v-if="gameState.isPaused && !gameState.isGameOver" class="pause-overlay">
          <div class="pause-message">
            <p class="pause-title">游戏暂停</p>
            <p class="pause-hint">按空格键开始游戏</p>
          </div>
        </div>
      </div>

      <GameControls
        :disabled="gameState.isGameOver || gameState.isPaused"
        @direction="handleDirection"
      />

      <div class="game-instructions">
        <p>使用方向键控制蛇的移动</p>
        <p>按空格键开始/暂停游戏</p>
        <p>吃到字母可以让蛇变长，获得分数</p>
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import type { SnakeGameState, SnakeGameConfig, Direction } from '@/types'
import {
  initSnakeGame,
  moveSnake,
  changeDirection,
  resetGame,
  generateFood,
  DEFAULT_SNAKE_CONFIG,
} from '@/utils/snakeGame'
import SnakeGameCanvas from '@/components/game/SnakeGameCanvas.vue'
import GameScore from '@/components/game/GameScore.vue'
import GameControls from '@/components/game/GameControls.vue'
import GameOverModal from '@/components/game/GameOverModal.vue'
import ChallengeSuccessModal from '@/components/game/ChallengeSuccessModal.vue'
import { CHALLENGE_SUCCESS_LENGTH, getMoveSpeedByLength } from '@/utils/snakeGame'

const router = useRouter()
const gameStore = useGameStore()

const gameConfig: SnakeGameConfig = {
  ...DEFAULT_SNAKE_CONFIG,
  // 使用默认配置（已增大）
}

const gameState = ref<SnakeGameState>(initSnakeGame(gameConfig))
let gameInterval: number | null = null
const showChallengeSuccess = ref(false)

// 初始化游戏
const initGame = () => {
  const newState = initSnakeGame(gameConfig)
  newState.food = generateFood(newState.snake, gameConfig)
  gameState.value = newState
  
  // 检查是否可以开始游戏
  if (!gameStore.canPlay) {
    router.push('/games')
    return
  }
  
  // 不自动开始游戏，等待用户按空格键
  // gameStore.startGame('snake')
  // startGameLoop()
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
    
    gameState.value = moveSnake(gameState.value, gameConfig)
    
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
  gameState.value = resetGame(gameConfig)
  gameState.value.food = generateFood(gameState.value.snake, gameConfig)
  // 重置后保持暂停状态，等待用户按空格开始
  gameState.value.isPaused = true
  
  // 不自动开始，等待用户按空格
  // if (gameStore.canPlay) {
  //   gameStore.startGame('snake')
  //   startGameLoop()
  // }
}

onMounted(() => {
  gameStore.checkAndResetDay()
  initGame()
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
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
  padding: 20px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.game-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.exit-btn {
  padding: 10px 20px;
  background: rgba(255, 107, 107, 0.8);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: #FFFFFF;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.exit-btn:hover {
  background: rgba(255, 107, 107, 1);
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(255, 107, 107, 0.3);
}

.exit-btn:active {
  transform: scale(0.95);
}

.game-container {
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.score-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}

.game-title {
  font-family: 'Courier New', monospace;
  font-size: 28px;
  font-weight: bold;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 3px;
  background: linear-gradient(135deg, #FFD700, #FF6B6B);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: titlePulse 2s ease-in-out infinite;
}

@keyframes titlePulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
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
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  border-radius: 8px;
}

.pause-message {
  text-align: center;
  padding: 30px;
  background: rgba(26, 26, 46, 0.9);
  border: 3px solid;
  border-image: linear-gradient(135deg, #FFD700, #FF6B6B) 1;
  border-radius: 12px;
}

.pause-title {
  font-family: 'Courier New', monospace;
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 15px 0;
  background: linear-gradient(135deg, #FFD700, #FF6B6B);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.pause-hint {
  font-family: 'Courier New', monospace;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

.game-instructions {
  text-align: center;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.8;
}

.game-instructions p {
  margin: 5px 0;
}

@media (max-width: 768px) {
  .game-title {
    font-size: 20px;
  }
  
  .snake-game-page {
    padding: 10px;
  }
}
</style>
