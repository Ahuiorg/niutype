import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GameTimeTracking, GameState } from '@/types'
import { GAME_CONFIG } from '@/types'
import { useAuthStore } from './auth'
import { getGameRecords, saveGameRecord, canStartGame as apiCanStartGame, getAvailablePlayMinutes } from '@/services/api/game.api'
import { getUserMembership } from '@/services/api/user.api'

interface OfflineGameItem {
  payload: {
    userId: string
    gameType: string
    date: string
    totalTimeMs: number
    completed: boolean
  }
  timestamp: number
}

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
  const authStore = useAuthStore()
  const currentUserId = computed(() => authStore.session?.user?.id ?? null)

  // 离线队列（仅内存，不持久化）
  const offlineQueue = ref<OfflineGameItem[]>([])
  const isOnline = ref(navigator.onLine)

  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      isOnline.value = true
      void flushOfflineQueue()
    })
    window.addEventListener('offline', () => {
      isOnline.value = false
    })
  }

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

  async function pushGameRecord(gameType: string) {
    const userId = currentUserId.value
    if (!userId) return
    const payload = {
      userId,
      gameType,
      date: getTodayDate(),
      totalTimeMs: gameTimeTracking.value.totalTime,
      completed: gameTimeTracking.value.completed,
    }
    if (!isOnline.value) {
      offlineQueue.value.push({ payload, timestamp: Date.now() })
      return
    }
    try {
      await saveGameRecord(payload)
    } catch {
      offlineQueue.value.push({ payload, timestamp: Date.now() })
    }
  }

  async function pullGameRecords() {
    const userId = currentUserId.value
    if (!userId) return
    await getGameRecords(userId)
  }

  async function flushOfflineQueue() {
    if (!isOnline.value) return
    const pending = [...offlineQueue.value]
    offlineQueue.value = []
    for (const item of pending) {
      try {
        await saveGameRecord(item.payload)
      } catch {
        offlineQueue.value.push(item)
      }
    }
  }

  async function checkCanStartGame(exerciseCompleted: boolean) {
    const userId = currentUserId.value
    if (!userId) return { allowed: false, reason: '未登录' }

    const role = (authStore.session?.user?.user_metadata?.role as 'student' | 'parent') ?? 'student'
    const membership = await getUserMembership(userId)
    const tier = membership?.membershipTier ?? 'free'

    return apiCanStartGame(userId, getTodayDate(), role, tier, exerciseCompleted)
  }

  async function fetchAvailablePlayMinutes() {
    const userId = currentUserId.value
    if (!userId) return null
    return getAvailablePlayMinutes(userId, getTodayDate())
  }

  // 重置所有游戏数据
  function reset() {
    resetGameTime()
    gameState.value = {
      isPlaying: false,
      currentGame: null,
      startTime: null,
    }
    offlineQueue.value = []
  }

  return {
    gameTimeTracking,
    gameState,
    remainingTime,
    canPlay,
    isOnline,
    offlineQueue,
    checkAndResetDay,
    startGame,
    stopGame,
    pauseGame,
    resumeGame,
    updateGameTime,
    pushGameRecord,
    pullGameRecords,
    flushOfflineQueue,
    checkCanStartGame,
    fetchAvailablePlayMinutes,
    reset,
  }
})
