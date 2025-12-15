import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useUserStore } from './user'
import { useAuthStore } from './auth'
import { generateExercise, getDayDescription } from '@/utils/exerciseGenerator'
import { EXERCISE_CONFIG } from '@/types'
import {
  batchUpdateLetterStats,
  getExerciseRecords,
  getLetterStats,
  saveExerciseRecord,
  type ExerciseRecord as CloudExerciseRecord,
} from '@/services/api/exercise.api'

interface OfflineQueueItem {
  type: 'record' | 'stats'
  payload: any
  timestamp: number
}

export const useExerciseStore = defineStore('exercise', () => {
  const userStore = useUserStore()
  const authStore = useAuthStore()
  const currentUserId = computed(() => authStore.session?.user?.id ?? null)

  // 离线队列（仅内存，不持久化）
  const offlineQueue = ref<OfflineQueueItem[]>([])
  const isOnline = ref(navigator.onLine)

  // 监听网络状态
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      isOnline.value = true
      void flushOfflineQueue()
    })
    window.addEventListener('offline', () => {
      isOnline.value = false
    })
  }

  // 状态
  const exercises = ref<string[]>([])
  const currentIndex = ref(0)
  const isRunning = ref(false)
  const isPaused = ref(false)
  const startTime = ref<number | null>(null)
  const pausedTime = ref(0)
  const lastCharTime = ref<number | null>(null)
  const showRestReminder = ref(false)
  const lastRestTime = ref(0)

  // 计算属性
  const currentChar = computed(() => exercises.value[currentIndex.value] || '')
  
  const progress = computed(() => {
    if (exercises.value.length === 0) return 0
    return (currentIndex.value / exercises.value.length) * 100
  })

  const elapsedTime = computed(() => {
    if (!startTime.value) return userStore.userData.todayProgress.totalTime
    if (isPaused.value) return pausedTime.value
    return Date.now() - startTime.value + userStore.userData.todayProgress.totalTime
  })

  const remainingTime = computed(() => {
    return Math.max(0, EXERCISE_CONFIG.dailyDuration - elapsedTime.value)
  })

  const isCompleted = computed(() => {
    return elapsedTime.value >= EXERCISE_CONFIG.dailyDuration
  })

  const dayDescription = computed(() => {
    return getDayDescription(userStore.userData.currentDay)
  })

  // 方法
  function initExercise() {
    userStore.checkAndResetDay()
    
    // 如果今天已完成，不生成新练习
    if (userStore.todayCompleted) {
      exercises.value = []
      return
    }

    // 生成练习内容
    exercises.value = generateExercise(
      userStore.userData.currentDay,
      userStore.userData.letterStats
    )
    currentIndex.value = 0
  }

  function start() {
    if (userStore.todayCompleted) return
    
    userStore.startExercise()
    isRunning.value = true
    isPaused.value = false
    startTime.value = Date.now()
    lastCharTime.value = Date.now()
    lastRestTime.value = Date.now()
  }

  function pause() {
    if (!isRunning.value || isPaused.value) return
    
    isPaused.value = true
    pausedTime.value = elapsedTime.value
  }

  function resume() {
    if (!isPaused.value) return
    
    isPaused.value = false
    // 调整开始时间以补偿暂停时间
    const pauseDuration = Date.now() - (startTime.value! + pausedTime.value - userStore.userData.todayProgress.totalTime)
    startTime.value! += pauseDuration
    lastCharTime.value = Date.now()
    lastRestTime.value = Date.now()
  }

  function handleInput(key: string): 'correct' | 'wrong' | 'ignore' {
    if (!isRunning.value || isPaused.value || !currentChar.value) {
      return 'ignore'
    }

    // 标准化输入（字母转大写，空格和符号保持原样）
    const inputKey = /^[a-z]$/i.test(key) ? key.toUpperCase() : key
    const targetKey = /^[a-z]$/i.test(currentChar.value) ? currentChar.value.toUpperCase() : currentChar.value
    
    // 接受字母、数字、空格和允许的符号
    const validChars = /^[A-Z0-9 `\-=\[\]\\;',./]$/
    if (!validChars.test(inputKey)) {
      return 'ignore'
    }

    const now = Date.now()
    const responseTime = lastCharTime.value ? now - lastCharTime.value : 0
    const isCorrect = inputKey === targetKey

    // 记录输入（空格不记录统计）
    if (targetKey !== ' ') {
      userStore.recordInput(targetKey, isCorrect, responseTime)
    }
    
    // 更新时间
    userStore.updateTodayTime(elapsedTime.value)

    // 无论正确还是错误，都移动到下一个字符
    currentIndex.value++
    lastCharTime.value = now

    // 检查是否需要生成更多练习内容
    if (currentIndex.value >= exercises.value.length && !isCompleted.value) {
      // 追加更多练习
      const moreExercises = generateExercise(
        userStore.userData.currentDay,
        userStore.userData.letterStats
      )
      exercises.value.push(...moreExercises)
    }

    // 检查休息提醒
    if (now - lastRestTime.value >= EXERCISE_CONFIG.restInterval) {
      showRestReminder.value = true
      lastRestTime.value = now
      pause()
    }

    return isCorrect ? 'correct' : 'wrong'
  }

  function dismissRestReminder() {
    showRestReminder.value = false
  }

  async function completeExercise() {
    isRunning.value = false
    isPaused.value = false
    userStore.updateTodayTime(elapsedTime.value)
    const result = userStore.completeDay()
    
    // 同步新解锁的成就到云端
    if (result.newAchievements.length > 0) {
      for (const achievement of result.newAchievements) {
        try {
          await userStore.unlockAchievementCloud(achievement.id)
        } catch (error) {
          console.warn('Failed to sync achievement:', achievement.id, error)
        }
      }
    }
    
    return result
  }

  // 重新练习（今天已完成后可继续练习）
  function restartExercise() {
    // 重新生成练习内容
    exercises.value = generateExercise(
      userStore.userData.currentDay - 1, // 使用当前天的内容（已经+1了）
      userStore.userData.letterStats
    )
    currentIndex.value = 0
    isRunning.value = true
    isPaused.value = false
    startTime.value = Date.now()
    lastCharTime.value = Date.now()
    lastRestTime.value = Date.now()
  }

  // 重新练习模式下处理输入（不发放积分，但记录统计）
  function handlePracticeInput(key: string): 'correct' | 'wrong' | 'ignore' {
    if (!isRunning.value || isPaused.value || !currentChar.value) {
      return 'ignore'
    }

    // 标准化输入（字母转大写，空格和符号保持原样）
    const inputKey = /^[a-z]$/i.test(key) ? key.toUpperCase() : key
    const targetKey = /^[a-z]$/i.test(currentChar.value) ? currentChar.value.toUpperCase() : currentChar.value
    
    // 接受字母、数字、空格和允许的符号
    const validChars = /^[A-Z0-9 `\-=\[\]\\;',./]$/
    if (!validChars.test(inputKey)) {
      return 'ignore'
    }

    const now = Date.now()
    const responseTime = lastCharTime.value ? now - lastCharTime.value : 0
    const isCorrect = inputKey === targetKey

    // 记录输入（空格不记录统计，计入总统计，但不影响今日进度）
    if (targetKey !== ' ') {
      userStore.recordPracticeInput(targetKey, isCorrect, responseTime)
    }

    // 无论正确还是错误，都移动到下一个字符
    currentIndex.value++
    lastCharTime.value = now

    // 检查是否需要生成更多练习内容
    if (currentIndex.value >= exercises.value.length) {
      const moreExercises = generateExercise(
        userStore.userData.currentDay - 1,
        userStore.userData.letterStats
      )
      exercises.value.push(...moreExercises)
    }

    return isCorrect ? 'correct' : 'wrong'
  }

  // 只重置本地状态，不保存到云端（用于登出时）
  function resetLocal() {
    exercises.value = []
    currentIndex.value = 0
    isRunning.value = false
    isPaused.value = false
    startTime.value = null
    pausedTime.value = 0
    lastCharTime.value = null
    showRestReminder.value = false
    lastRestTime.value = 0
    offlineQueue.value = []
  }

  async function reset() {
    // 在重置前保存当前练习时间
    if (isRunning.value && startTime.value) {
      userStore.updateTodayTime(elapsedTime.value)
    }

    // 同步数据到云端
    const userId = currentUserId.value
    if (userId) {
      try {
        const today = new Date().toISOString().split('T')[0]
        const progress = userStore.userData.todayProgress
        
        // 如果有练习数据，保存今日记录
        if (progress.totalChars > 0) {
          const accuracy = progress.totalChars > 0 
            ? progress.correctChars / progress.totalChars 
            : 0
          const avgResponseTime = progress.totalChars > 0 
            ? progress.totalTime / progress.totalChars 
            : 0
          
          await saveExerciseRecord({
            userId,
            day: userStore.userData.currentDay,
            date: today,
            totalChars: progress.totalChars,
            correctChars: progress.correctChars,
            totalTimeMs: progress.totalTime,
            earnedPoints: 0, // 积分在 completeDay 时计算
            accuracy,
            avgResponseTimeMs: avgResponseTime,
          })
        }

        await Promise.all([
          pushStatsToCloud(),
          userStore.pushProgressToCloud(),
        ])
      } catch (error) {
        console.warn('Failed to sync data to cloud:', error)
      }
    }

    exercises.value = []
    currentIndex.value = 0
    isRunning.value = false
    isPaused.value = false
    startTime.value = null
    pausedTime.value = 0
    lastCharTime.value = null
    showRestReminder.value = false
    lastRestTime.value = 0
  }

  async function pullFromCloud() {
    const userId = currentUserId.value
    if (!userId) return
    const [records, letters] = await Promise.all([getExerciseRecords(userId), getLetterStats(userId)])
    userStore.userData.dailyRecords = records.map((r) => ({
      day: r.day,
      date: r.date,
      totalChars: r.totalChars,
      correctChars: r.correctChars,
      totalTime: r.totalTimeMs,
      earnedPoints: r.earnedPoints,
      accuracy: r.accuracy,
      avgResponseTime: r.avgResponseTimeMs,
    }))
    
    // 恢复今日进度
    const today = new Date().toISOString().split('T')[0]
    const todayRecord = records.find((r) => r.date === today)
    if (todayRecord) {
      userStore.userData.todayProgress = {
        date: today,
        startTime: null,
        totalTime: todayRecord.totalTimeMs,
        completed: todayRecord.earnedPoints > 0, // 有积分说明已完成
        totalChars: todayRecord.totalChars,
        correctChars: todayRecord.correctChars,
      }
    }
    
    const nextStats = JSON.parse(JSON.stringify(userStore.userData.letterStats))
    letters.forEach((l) => {
      nextStats[l.letter] = {
        totalAttempts: l.totalAttempts,
        correctAttempts: l.correctAttempts,
        totalResponseTime: l.totalResponseTimeMs,
      }
    })
    userStore.userData.letterStats = nextStats
  }

  async function pushStatsToCloud() {
    const userId = currentUserId.value
    if (!userId) return
    const statsArray = Object.entries(userStore.userData.letterStats).map(([letter, stat]) => ({
      letter,
      totalAttempts: stat.totalAttempts,
      correctAttempts: stat.correctAttempts,
      totalResponseTimeMs: stat.totalResponseTime,
    }))
    if (!isOnline.value) {
      offlineQueue.value.push({ type: 'stats', payload: { userId, statsArray }, timestamp: Date.now() })
      return
    }
    try {
      await batchUpdateLetterStats(userId, statsArray)
    } catch {
      offlineQueue.value.push({ type: 'stats', payload: { userId, statsArray }, timestamp: Date.now() })
    }
  }

  async function pushRecordToCloud(record: CloudExerciseRecord) {
    const userId = currentUserId.value
    if (!userId) return
    const payload = {
      ...record,
      userId,
      totalTimeMs: record.totalTimeMs ?? (record as any).totalTime,
      avgResponseTimeMs: record.avgResponseTimeMs ?? (record as any).avgResponseTime,
    }
    if (!isOnline.value) {
      offlineQueue.value.push({ type: 'record', payload, timestamp: Date.now() })
      return
    }
    try {
      await saveExerciseRecord(payload)
    } catch {
      offlineQueue.value.push({ type: 'record', payload, timestamp: Date.now() })
    }
  }

  async function flushOfflineQueue() {
    if (!isOnline.value) return
    const pending = [...offlineQueue.value]
    offlineQueue.value = []
    for (const item of pending) {
      try {
        if (item.type === 'stats') {
          await batchUpdateLetterStats(item.payload.userId, item.payload.statsArray)
        } else if (item.type === 'record') {
          await saveExerciseRecord(item.payload)
        }
      } catch {
        offlineQueue.value.push(item)
      }
    }
  }

  return {
    // 状态
    exercises,
    currentIndex,
    isRunning,
    isPaused,
    showRestReminder,
    isOnline,
    offlineQueue,
    // 计算属性
    currentChar,
    progress,
    elapsedTime,
    remainingTime,
    isCompleted,
    dayDescription,
    // 方法
    initExercise,
    start,
    pause,
    resume,
    handleInput,
    handlePracticeInput,
    dismissRestReminder,
    completeExercise,
    restartExercise,
    reset,
    resetLocal,
    pullFromCloud,
    pushStatsToCloud,
    pushRecordToCloud,
    flushOfflineQueue,
  }
})

