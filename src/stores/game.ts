import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GameTimeTracking, GameState } from '@/types'
import { GAME_CONFIG } from '@/types'

// 获取今天的日期字符串
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}

// 初始化游戏时间追踪
function getDefaultGameTimeTracking(): GameTimeTracking {
  return {
    date: getTodayDate(),
    startTime: null,
    totalTime: 0,
    completed: false,
  }
}

export const useGameStore = defineStore('game', () => {
  // 状态
  const gameTimeTracking = ref<GameTimeTracking>(getDefaultGameTimeTracking())
  const gameState = ref<GameState>({
    isPlaying: false,
    currentGame: null,
    startTime: null,
  })

  // 计算属性
  const remainingTime = computed(() => {
    const today = getTodayDate()
    
    // 如果日期变化，重置
    if (gameTimeTracking.value.date !== today) {
      resetGameTime()
      return GAME_CONFIG.dailyDuration
    }

    // 如果正在游戏，计算已用时间
    if (gameState.value.isPlaying && gameState.value.startTime) {
      const elapsed = Date.now() - gameState.value.startTime
      const used = gameTimeTracking.value.totalTime + elapsed
      return Math.max(0, GAME_CONFIG.dailyDuration - used)
    }

    // 否则返回剩余时间
    return Math.max(0, GAME_CONFIG.dailyDuration - gameTimeTracking.value.totalTime)
  })

  const canPlay = computed(() => {
    return remainingTime.value > 0 && !gameTimeTracking.value.completed
  })

  // 方法
  function checkAndResetDay() {
    const today = getTodayDate()
    if (gameTimeTracking.value.date !== today) {
      resetGameTime()
    }
  }

  function resetGameTime() {
    const today = getTodayDate()
    gameTimeTracking.value = {
      date: today,
      startTime: null,
      totalTime: 0,
      completed: false,
    }
  }

  function startGame(gameId: string) {
    checkAndResetDay()
    
    if (!canPlay.value) {
      return false
    }

    gameState.value = {
      isPlaying: true,
      currentGame: gameId,
      startTime: Date.now(),
    }

    if (!gameTimeTracking.value.startTime) {
      gameTimeTracking.value.startTime = Date.now()
    }

    return true
  }

  function stopGame() {
    if (gameState.value.isPlaying && gameState.value.startTime) {
      const elapsed = Date.now() - gameState.value.startTime
      gameTimeTracking.value.totalTime += elapsed

      // 检查是否用完时间
      if (gameTimeTracking.value.totalTime >= GAME_CONFIG.dailyDuration) {
        gameTimeTracking.value.completed = true
        gameTimeTracking.value.totalTime = GAME_CONFIG.dailyDuration
      }
    }

    gameState.value = {
      isPlaying: false,
      currentGame: null,
      startTime: null,
    }
  }

  function pauseGame() {
    if (gameState.value.isPlaying && gameState.value.startTime) {
      const elapsed = Date.now() - gameState.value.startTime
      gameTimeTracking.value.totalTime += elapsed
    }

    if (gameState.value.startTime) {
      gameState.value.startTime = null
    }
  }

  function resumeGame() {
    if (!canPlay.value) {
      return false
    }

    if (gameState.value.isPlaying) {
      gameState.value.startTime = Date.now()
      return true
    }

    return false
  }

  function updateGameTime() {
    if (gameState.value.isPlaying && gameState.value.startTime) {
      const elapsed = Date.now() - gameState.value.startTime
      const totalUsed = gameTimeTracking.value.totalTime + elapsed

      if (totalUsed >= GAME_CONFIG.dailyDuration) {
        gameTimeTracking.value.totalTime = GAME_CONFIG.dailyDuration
        gameTimeTracking.value.completed = true
        stopGame()
      }
    }
  }

  return {
    gameTimeTracking,
    gameState,
    remainingTime,
    canPlay,
    checkAndResetDay,
    startGame,
    stopGame,
    pauseGame,
    resumeGame,
    updateGameTime,
  }
}, {
  persist: true,
})
