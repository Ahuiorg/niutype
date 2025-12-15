import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useUserStore } from './user'
import { generateExercise, getDayDescription } from '@/utils/exerciseGenerator'
import { EXERCISE_CONFIG } from '@/types'

export const useExerciseStore = defineStore('exercise', () => {
  const userStore = useUserStore()

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

    // 标准化输入（字母转大写，符号保持原样）
    const inputKey = /^[a-z]$/i.test(key) ? key.toUpperCase() : key
    const targetKey = /^[a-z]$/i.test(currentChar.value) ? currentChar.value.toUpperCase() : currentChar.value
    
    // 接受字母、数字和允许的符号
    const validChars = /^[A-Z0-9`\-=\[\]\\;',./]$/
    if (!validChars.test(inputKey)) {
      return 'ignore'
    }

    const now = Date.now()
    const responseTime = lastCharTime.value ? now - lastCharTime.value : 0
    const isCorrect = inputKey === targetKey

    // 记录输入
    userStore.recordInput(targetKey, isCorrect, responseTime)
    
    // 更新时间
    userStore.updateTodayTime(elapsedTime.value)

    if (isCorrect) {
      // 正确，移动到下一个字符
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

      return 'correct'
    }

    return 'wrong'
  }

  function dismissRestReminder() {
    showRestReminder.value = false
  }

  function completeExercise() {
    isRunning.value = false
    isPaused.value = false
    userStore.updateTodayTime(elapsedTime.value)
    return userStore.completeDay()
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

    // 标准化输入（字母转大写，符号保持原样）
    const inputKey = /^[a-z]$/i.test(key) ? key.toUpperCase() : key
    const targetKey = /^[a-z]$/i.test(currentChar.value) ? currentChar.value.toUpperCase() : currentChar.value
    
    // 接受字母、数字和允许的符号
    const validChars = /^[A-Z0-9`\-=\[\]\\;',./]$/
    if (!validChars.test(inputKey)) {
      return 'ignore'
    }

    const now = Date.now()
    const responseTime = lastCharTime.value ? now - lastCharTime.value : 0
    const isCorrect = inputKey === targetKey

    // 记录输入（计入总统计，但不影响今日进度）
    userStore.recordPracticeInput(targetKey, isCorrect, responseTime)

    if (isCorrect) {
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

      return 'correct'
    }

    return 'wrong'
  }

  function reset() {
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

  return {
    // 状态
    exercises,
    currentIndex,
    isRunning,
    isPaused,
    showRestReminder,
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
  }
})

