import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  UserData, 
  TodayProgress, 
  LetterStat, 
  DailyRecord,
  Gift,
  RedeemedGift,
  UnlockedAchievement,
  UserStats 
} from '@/types'
import { calculatePoints } from '@/utils/pointsCalculator'
import { checkNewAchievements, ACHIEVEMENTS } from '@/utils/achievementChecker'
import { ALL_LETTERS } from '@/utils/fingerMapping'

// 获取今天的日期字符串
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}

// 初始化字母统计
function initLetterStats(): Record<string, LetterStat> {
  const stats: Record<string, LetterStat> = {}
  for (const letter of ALL_LETTERS) {
    stats[letter] = {
      totalAttempts: 0,
      correctAttempts: 0,
      totalResponseTime: 0,
    }
  }
  return stats
}

// 初始用户数据
function getDefaultUserData(): UserData {
  return {
    currentDay: 1,
    consecutiveDays: 0,
    lastCompletedDate: null,
    todayProgress: {
      date: getTodayDate(),
      startTime: null,
      totalTime: 0,
      completed: false,
      totalChars: 0,
      correctChars: 0,
    },
    totalPoints: 0,
    usedPoints: 0,
    gifts: [],
    redeemedGifts: [],
    achievements: [],
    letterStats: initLetterStats(),
    dailyRecords: [],
    soundEnabled: true,
  }
}

export const useUserStore = defineStore('user', () => {
  // 状态
  const userData = ref<UserData>(getDefaultUserData())

  // 计算属性
  const availablePoints = computed(() => userData.value.totalPoints - userData.value.usedPoints)
  
  const todayCompleted = computed(() => {
    const today = getTodayDate()
    return userData.value.todayProgress.date === today && userData.value.todayProgress.completed
  })

  const overallAccuracy = computed(() => {
    let total = 0
    let correct = 0
    for (const letter of ALL_LETTERS) {
      const stat = userData.value.letterStats[letter]
      if (stat) {
        total += stat.totalAttempts
        correct += stat.correctAttempts
      }
    }
    return total > 0 ? correct / total : 0
  })

  const totalChars = computed(() => {
    let total = 0
    for (const letter of ALL_LETTERS) {
      total += userData.value.letterStats[letter]?.totalAttempts || 0
    }
    return total
  })

  const avgResponseTime = computed(() => {
    let totalTime = 0
    let totalAttempts = 0
    for (const letter of ALL_LETTERS) {
      const stat = userData.value.letterStats[letter]
      if (stat) {
        totalTime += stat.totalResponseTime
        totalAttempts += stat.totalAttempts
      }
    }
    return totalAttempts > 0 ? totalTime / totalAttempts : 0
  })

  const perfectDays = computed(() => {
    return userData.value.dailyRecords.filter(r => r.accuracy >= 1).length
  })

  // 获取用户统计（用于成就检测）
  const userStats = computed((): UserStats => ({
    currentDay: userData.value.currentDay,
    consecutiveDays: userData.value.consecutiveDays,
    totalChars: totalChars.value,
    overallAccuracy: overallAccuracy.value,
    avgResponseTime: avgResponseTime.value,
    todayAccuracy: userData.value.todayProgress.totalChars > 0 
      ? userData.value.todayProgress.correctChars / userData.value.todayProgress.totalChars 
      : 0,
    perfectDays: perfectDays.value,
  }))

  // 方法
  function checkAndResetDay() {
    const today = getTodayDate()
    if (userData.value.todayProgress.date !== today) {
      // 新的一天，重置今日进度
      userData.value.todayProgress = {
        date: today,
        startTime: null,
        totalTime: 0,
        completed: false,
        totalChars: 0,
        correctChars: 0,
      }
      
      // 检查连续天数
      if (userData.value.lastCompletedDate) {
        const lastDate = new Date(userData.value.lastCompletedDate)
        const todayDate = new Date(today)
        const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (diffDays > 1) {
          // 断签，重置连续天数
          userData.value.consecutiveDays = 0
        }
      }
    }
  }

  function startExercise() {
    checkAndResetDay()
    if (!userData.value.todayProgress.startTime) {
      userData.value.todayProgress.startTime = Date.now()
    }
  }

  function recordInput(letter: string, correct: boolean, responseTime: number) {
    const upperLetter = letter.toUpperCase()
    if (!userData.value.letterStats[upperLetter]) {
      userData.value.letterStats[upperLetter] = {
        totalAttempts: 0,
        correctAttempts: 0,
        totalResponseTime: 0,
      }
    }
    
    userData.value.letterStats[upperLetter].totalAttempts++
    if (correct) {
      userData.value.letterStats[upperLetter].correctAttempts++
    }
    userData.value.letterStats[upperLetter].totalResponseTime += responseTime
    
    userData.value.todayProgress.totalChars++
    if (correct) {
      userData.value.todayProgress.correctChars++
    }
  }

  // 重新练习时记录输入（计入总统计，不影响今日进度）
  function recordPracticeInput(letter: string, correct: boolean, responseTime: number) {
    const upperLetter = letter.toUpperCase()
    if (!userData.value.letterStats[upperLetter]) {
      userData.value.letterStats[upperLetter] = {
        totalAttempts: 0,
        correctAttempts: 0,
        totalResponseTime: 0,
      }
    }
    
    userData.value.letterStats[upperLetter].totalAttempts++
    if (correct) {
      userData.value.letterStats[upperLetter].correctAttempts++
    }
    userData.value.letterStats[upperLetter].totalResponseTime += responseTime
  }

  function updateTodayTime(elapsedTime: number) {
    userData.value.todayProgress.totalTime = elapsedTime
  }

  function completeDay(): { points: ReturnType<typeof calculatePoints>; newAchievements: typeof ACHIEVEMENTS } {
    const today = getTodayDate()
    
    // 计算连续天数
    if (userData.value.lastCompletedDate) {
      const lastDate = new Date(userData.value.lastCompletedDate)
      const todayDate = new Date(today)
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) {
        userData.value.consecutiveDays++
      } else if (diffDays > 1) {
        userData.value.consecutiveDays = 1
      }
    } else {
      userData.value.consecutiveDays = 1
    }
    
    // 计算积分
    const points = calculatePoints({
      totalChars: userData.value.todayProgress.totalChars,
      correctChars: userData.value.todayProgress.correctChars,
      totalTime: userData.value.todayProgress.totalTime,
      consecutiveDays: userData.value.consecutiveDays,
    })
    
    // 记录今日数据
    const accuracy = userData.value.todayProgress.totalChars > 0 
      ? userData.value.todayProgress.correctChars / userData.value.todayProgress.totalChars 
      : 0
    
    const dailyRecord: DailyRecord = {
      day: userData.value.currentDay,
      date: today,
      totalChars: userData.value.todayProgress.totalChars,
      correctChars: userData.value.todayProgress.correctChars,
      totalTime: userData.value.todayProgress.totalTime,
      earnedPoints: points.total,
      accuracy,
      avgResponseTime: userData.value.todayProgress.totalChars > 0 
        ? userData.value.todayProgress.totalTime / userData.value.todayProgress.totalChars 
        : 0,
    }
    userData.value.dailyRecords.push(dailyRecord)
    
    // 更新状态
    userData.value.totalPoints += points.total
    userData.value.todayProgress.completed = true
    userData.value.lastCompletedDate = today
    userData.value.currentDay++
    
    // 检查新成就
    const unlockedIds = userData.value.achievements.map(a => a.id)
    const newAchievements = checkNewAchievements(userStats.value, unlockedIds)
    
    // 记录新成就
    for (const achievement of newAchievements) {
      userData.value.achievements.push({
        id: achievement.id,
        unlockedAt: new Date().toISOString(),
      })
    }
    
    return { points, newAchievements }
  }

  // 礼物相关
  function addGift(name: string, points: number, image?: string) {
    const gift: Gift = {
      id: Date.now().toString(),
      name,
      points,
      image,
      createdAt: new Date().toISOString(),
    }
    userData.value.gifts.push(gift)
  }

  function removeGift(giftId: string) {
    const index = userData.value.gifts.findIndex(g => g.id === giftId)
    if (index !== -1) {
      userData.value.gifts.splice(index, 1)
    }
  }

  function redeemGift(giftId: string): boolean {
    const gift = userData.value.gifts.find(g => g.id === giftId)
    if (!gift || availablePoints.value < gift.points) {
      return false
    }
    
    userData.value.usedPoints += gift.points
    
    const redeemed: RedeemedGift = {
      id: Date.now().toString(),
      giftId: gift.id,
      giftName: gift.name,
      points: gift.points,
      redeemedAt: new Date().toISOString(),
    }
    userData.value.redeemedGifts.push(redeemed)
    
    return true
  }

  function claimGift(redeemedId: string) {
    const redeemed = userData.value.redeemedGifts.find(r => r.id === redeemedId)
    if (redeemed && !redeemed.claimedAt) {
      redeemed.claimedAt = new Date().toISOString()
    }
  }

  // 设置
  function toggleSound() {
    userData.value.soundEnabled = !userData.value.soundEnabled
  }

  // 数据导入导出
  function exportData(): string {
    return JSON.stringify(userData.value, null, 2)
  }

  function importData(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr)
      // 基本验证
      if (typeof data.currentDay !== 'number') {
        return false
      }
      userData.value = data
      return true
    } catch {
      return false
    }
  }

  function resetData() {
    userData.value = getDefaultUserData()
  }

  return {
    // 状态
    userData,
    // 计算属性
    availablePoints,
    todayCompleted,
    overallAccuracy,
    totalChars,
    avgResponseTime,
    perfectDays,
    userStats,
    // 方法
    checkAndResetDay,
    startExercise,
    recordInput,
    recordPracticeInput,
    updateTodayTime,
    completeDay,
    addGift,
    removeGift,
    redeemGift,
    claimGift,
    toggleSound,
    exportData,
    importData,
    resetData,
  }
}, {
  persist: true,
})

