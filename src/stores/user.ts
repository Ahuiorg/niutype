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
import { useAuthStore } from './auth'
import {
  getUserProfile,
  getUserProgress,
  updateUserProfile,
  updateUserProgress,
  type MembershipTier,
} from '@/services/api/user.api'
import { getUserPoints, addPoints, deductPoints } from '@/services/api/points.api'
import { getAvailableGifts, getRedeemedGifts, redeemGift as redeemGiftApi } from '@/services/api/gift.api'
import { getUserAchievements, unlockAchievement } from '@/services/api/achievement.api'

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
  const membership = ref<{ tier: MembershipTier; expiresAt: string | null; level: number }>({
    tier: 'free',
    expiresAt: null,
    level: 1,
  })

  // 计算属性
  const availablePoints = computed(() => userData.value.totalPoints - userData.value.usedPoints)
  const currentUserId = computed(() => useAuthStore().session?.user?.id ?? null)
  
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
    void pushProfileSettings()
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

  async function loadFromCloud() {
    const userId = currentUserId.value
    if (!userId) return

    const [profile, progress] = await Promise.all([getUserProfile(userId), getUserProgress(userId)])

    if (profile) {
      membership.value = {
        tier: profile.membershipTier,
        expiresAt: profile.membershipExpiresAt,
        level: profile.level,
      }
      if (profile.soundEnabled !== null && profile.soundEnabled !== undefined) {
        userData.value.soundEnabled = profile.soundEnabled
      }
    }

    if (progress) {
      userData.value.currentDay = progress.currentDay
      userData.value.consecutiveDays = progress.consecutiveDays
      userData.value.lastCompletedDate = progress.lastCompletedDate
      userData.value.totalPoints = progress.totalPoints
      userData.value.usedPoints = progress.usedPoints
    }
  }

  async function pushProgressToCloud() {
    const userId = currentUserId.value
    if (!userId) return
    await updateUserProgress(userId, {
      currentDay: userData.value.currentDay,
      consecutiveDays: userData.value.consecutiveDays,
      lastCompletedDate: userData.value.lastCompletedDate,
      totalPoints: userData.value.totalPoints,
      usedPoints: userData.value.usedPoints,
    })
  }

  async function pushProfileSettings() {
    const userId = currentUserId.value
    if (!userId) return
    await updateUserProfile(userId, {
      soundEnabled: userData.value.soundEnabled,
      membershipTier: membership.value.tier,
      membershipExpiresAt: membership.value.expiresAt,
      level: membership.value.level,
    })
  }

  async function syncPointsFromCloud() {
    const userId = currentUserId.value
    if (!userId) return
    // 从 user_progress 获取积分（与 redeemGift 保持一致）
    const progress = await getUserProgress(userId)
    if (progress) {
      userData.value.totalPoints = progress.totalPoints
      userData.value.usedPoints = progress.usedPoints
    }
  }

  async function addPointsCloud(delta: number, reason?: string) {
    const userId = currentUserId.value
    if (!userId) return
    await addPoints(userId, delta, reason)
    userData.value.totalPoints += Math.abs(delta)
  }

  async function deductPointsCloud(delta: number, reason?: string) {
    const userId = currentUserId.value
    if (!userId) return
    await deductPoints(userId, delta, reason)
    userData.value.usedPoints += Math.abs(delta)
  }

  async function syncGiftsFromCloud() {
    const userId = currentUserId.value
    if (!userId) return
    const [available, redeemed] = await Promise.all([getAvailableGifts(), getRedeemedGifts(userId)])
    userData.value.gifts = available.map((g) => ({
      id: g.id,
      name: g.name,
      points: g.points,
      image: g.imageUrl ?? undefined,
      createdAt: new Date().toISOString(),
    }))
    userData.value.redeemedGifts = redeemed.map((r) => ({
      id: r.id,
      giftId: r.giftId,
      giftName: available.find((g) => g.id === r.giftId)?.name || '',
      points: r.points,
      redeemedAt: r.redeemedAt,
      claimedAt: r.claimedAt || undefined,
    }))
  }

  async function redeemGiftCloud(giftId: string) {
    const userId = currentUserId.value
    if (!userId) return false
    try {
      const redeemed = await redeemGiftApi(userId, giftId)
      if (redeemed) {
        // 同步积分和兑换记录
        await syncPointsFromCloud()
        await syncGiftsFromCloud()
        return true
      }
      return false
    } catch (error) {
      console.error('Redeem gift failed:', error)
      return false
    }
  }

  async function syncAchievementsFromCloud() {
    const userId = currentUserId.value
    if (!userId) return
    const list = await getUserAchievements(userId)
    userData.value.achievements = list.map((a) => ({
      id: a.achievementId,
      unlockedAt: a.unlockedAt,
    }))
  }

  async function unlockAchievementCloud(achievementId: string) {
    const userId = currentUserId.value
    if (!userId) return
    // 检查是否已经在本地解锁
    if (userData.value.achievements.some(a => a.id === achievementId)) {
      return
    }
    await unlockAchievement(userId, achievementId)
    userData.value.achievements.push({ id: achievementId, unlockedAt: new Date().toISOString() })
  }

  // 检查并同步所有应该解锁的成就
  async function checkAndSyncAchievements() {
    const userId = currentUserId.value
    if (!userId) return
    
    const unlockedIds = userData.value.achievements.map(a => a.id)
    const newAchievements = checkNewAchievements(userStats.value, unlockedIds)
    
    // 同步新解锁的成就到云端
    for (const achievement of newAchievements) {
      try {
        await unlockAchievement(userId, achievement.id)
        userData.value.achievements.push({
          id: achievement.id,
          unlockedAt: new Date().toISOString(),
        })
      } catch (error) {
        console.warn('Failed to sync achievement:', achievement.id, error)
      }
    }
    
    return newAchievements
  }

  return {
    // 状态
    userData,
    membership,
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
    syncPointsFromCloud,
    addPointsCloud,
    deductPointsCloud,
    syncGiftsFromCloud,
    redeemGiftCloud,
    syncAchievementsFromCloud,
    unlockAchievementCloud,
    checkAndSyncAchievements,
    toggleSound,
    exportData,
    importData,
    resetData,
    loadFromCloud,
    pushProgressToCloud,
    pushProfileSettings,
  }
})

