import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import { useExerciseStore } from '@/stores/exercise'
import { useGameStore } from '@/stores/game'
import {
  getUserProfile,
  getUserProgress,
  updateUserProfile,
  updateUserProgress,
} from '@/services/api/user.api'
import {
  getExerciseRecords,
  getLetterStats,
  saveExerciseRecord,
  batchUpdateLetterStats,
} from '@/services/api/exercise.api'
import { getGameRecords, saveGameRecord } from '@/services/api/game.api'
import { getUserPoints, addPoints } from '@/services/api/points.api'
import { getUserAchievements } from '@/services/api/achievement.api'
import { getRedeemedGifts } from '@/services/api/gift.api'

export type SyncDirection = 'toCloud' | 'fromCloud' | 'merge'

export interface SyncResult {
  success: boolean
  synced: string[]
  errors: string[]
  conflicts?: ConflictInfo[]
}

export interface ConflictInfo {
  module: string
  field: string
  localValue: any
  cloudValue: any
  resolution?: 'local' | 'cloud' | 'merged'
}

interface LocalSnapshot {
  profile: {
    nickname: string
    soundEnabled: boolean
    settings: Record<string, any>
  }
  progress: {
    currentDay: number
    consecutiveDays: number
    lastCompletedDate: string | null
    totalPoints: number
    usedPoints: number
  }
  letterStats: Record<string, { totalAttempts: number; correctAttempts: number; totalResponseTime: number }>
  dailyRecords: Array<{
    day: number
    date: string
    totalChars: number
    correctChars: number
    totalTime: number
    earnedPoints: number
    accuracy: number
    avgResponseTime: number
  }>
}

function getLocalSnapshot(userStore: ReturnType<typeof useUserStore>): LocalSnapshot {
  return {
    profile: {
      nickname: userStore.userData.settings.nickname,
      soundEnabled: userStore.userData.settings.soundEnabled,
      settings: { ...userStore.userData.settings },
    },
    progress: {
      currentDay: userStore.userData.currentDay,
      consecutiveDays: userStore.userData.consecutiveDays,
      lastCompletedDate: userStore.userData.lastCompletedDate,
      totalPoints: userStore.userData.totalPoints,
      usedPoints: userStore.userData.usedPoints,
    },
    letterStats: JSON.parse(JSON.stringify(userStore.userData.letterStats)),
    dailyRecords: JSON.parse(JSON.stringify(userStore.userData.dailyRecords)),
  }
}

function detectConflicts(local: LocalSnapshot, cloud: any): ConflictInfo[] {
  const conflicts: ConflictInfo[] = []

  // 检测进度冲突（以较大 currentDay 为准）
  if (cloud.progress && local.progress.currentDay !== cloud.progress.currentDay) {
    conflicts.push({
      module: 'progress',
      field: 'currentDay',
      localValue: local.progress.currentDay,
      cloudValue: cloud.progress.currentDay,
    })
  }

  // 检测积分冲突
  if (cloud.progress && local.progress.totalPoints !== cloud.progress.totalPoints) {
    conflicts.push({
      module: 'progress',
      field: 'totalPoints',
      localValue: local.progress.totalPoints,
      cloudValue: cloud.progress.totalPoints,
    })
  }

  return conflicts
}

function resolveConflicts(conflicts: ConflictInfo[], strategy: 'localWins' | 'cloudWins' | 'latestWins' = 'latestWins'): ConflictInfo[] {
  return conflicts.map((c) => {
    let resolution: 'local' | 'cloud' | 'merged' = 'cloud'

    if (strategy === 'localWins') {
      resolution = 'local'
    } else if (strategy === 'cloudWins') {
      resolution = 'cloud'
    } else {
      // latestWins: 对于 currentDay 取较大值，对于 totalPoints 取较大值
      if (c.field === 'currentDay' || c.field === 'totalPoints') {
        resolution = c.localValue > c.cloudValue ? 'local' : 'cloud'
      }
    }

    return { ...c, resolution }
  })
}

export async function syncToCloud(): Promise<SyncResult> {
  const authStore = useAuthStore()
  const userStore = useUserStore()
  const exerciseStore = useExerciseStore()
  const gameStore = useGameStore()

  const userId = authStore.session?.user?.id
  if (!userId) {
    return { success: false, synced: [], errors: ['未登录'] }
  }

  const synced: string[] = []
  const errors: string[] = []

  try {
    // 同步用户资料
    await updateUserProfile(userId, {
      nickname: userStore.userData.settings.nickname,
      soundEnabled: userStore.userData.settings.soundEnabled,
    })
    synced.push('profile')
  } catch (e) {
    errors.push(`profile: ${e instanceof Error ? e.message : '同步失败'}`)
  }

  try {
    // 同步用户进度
    await updateUserProgress(userId, {
      currentDay: userStore.userData.currentDay,
      consecutiveDays: userStore.userData.consecutiveDays,
      lastCompletedDate: userStore.userData.lastCompletedDate,
      totalPoints: userStore.userData.totalPoints,
      usedPoints: userStore.userData.usedPoints,
    })
    synced.push('progress')
  } catch (e) {
    errors.push(`progress: ${e instanceof Error ? e.message : '同步失败'}`)
  }

  try {
    // 同步字母统计
    await exerciseStore.pushStatsToCloud()
    synced.push('letterStats')
  } catch (e) {
    errors.push(`letterStats: ${e instanceof Error ? e.message : '同步失败'}`)
  }

  try {
    // 刷新离线队列
    await exerciseStore.flushOfflineQueue()
    synced.push('exerciseQueue')
  } catch (e) {
    errors.push(`exerciseQueue: ${e instanceof Error ? e.message : '同步失败'}`)
  }

  try {
    // 游戏离线队列
    await gameStore.flushOfflineQueue()
    synced.push('gameQueue')
  } catch (e) {
    errors.push(`gameQueue: ${e instanceof Error ? e.message : '同步失败'}`)
  }

  return {
    success: errors.length === 0,
    synced,
    errors,
  }
}

export async function syncFromCloud(): Promise<SyncResult> {
  const authStore = useAuthStore()
  const userStore = useUserStore()
  const exerciseStore = useExerciseStore()

  const userId = authStore.session?.user?.id
  if (!userId) {
    return { success: false, synced: [], errors: ['未登录'] }
  }

  const synced: string[] = []
  const errors: string[] = []

  try {
    const profile = await getUserProfile(userId)
    if (profile) {
      userStore.userData.settings.nickname = profile.nickname
      userStore.userData.settings.soundEnabled = profile.soundEnabled ?? true
      synced.push('profile')
    }
  } catch (e) {
    errors.push(`profile: ${e instanceof Error ? e.message : '同步失败'}`)
  }

  try {
    const progress = await getUserProgress(userId)
    if (progress) {
      userStore.userData.currentDay = progress.currentDay
      userStore.userData.consecutiveDays = progress.consecutiveDays
      userStore.userData.lastCompletedDate = progress.lastCompletedDate
      userStore.userData.totalPoints = progress.totalPoints
      userStore.userData.usedPoints = progress.usedPoints
      synced.push('progress')
    }
  } catch (e) {
    errors.push(`progress: ${e instanceof Error ? e.message : '同步失败'}`)
  }

  try {
    await exerciseStore.pullFromCloud()
    synced.push('exerciseRecords')
    synced.push('letterStats')
  } catch (e) {
    errors.push(`exerciseRecords: ${e instanceof Error ? e.message : '同步失败'}`)
  }

  try {
    const points = await getUserPoints(userId)
    if (points !== null) {
      // 从云端获取的积分已在 progress 中，这里只做验证
      synced.push('points')
    }
  } catch (e) {
    errors.push(`points: ${e instanceof Error ? e.message : '同步失败'}`)
  }

  try {
    const achievements = await getUserAchievements(userId)
    userStore.userData.achievements = achievements.map((a) => a.achievementId)
    synced.push('achievements')
  } catch (e) {
    errors.push(`achievements: ${e instanceof Error ? e.message : '同步失败'}`)
  }

  try {
    const redeemedGifts = await getRedeemedGifts(userId)
    userStore.userData.redeemedGifts = redeemedGifts.map((g) => ({
      giftId: g.giftId,
      redeemedAt: g.redeemedAt,
      pointsSpent: g.pointsSpent,
    }))
    synced.push('redeemedGifts')
  } catch (e) {
    errors.push(`redeemedGifts: ${e instanceof Error ? e.message : '同步失败'}`)
  }

  return {
    success: errors.length === 0,
    synced,
    errors,
  }
}

export async function mergeSync(): Promise<SyncResult> {
  const authStore = useAuthStore()
  const userStore = useUserStore()

  const userId = authStore.session?.user?.id
  if (!userId) {
    return { success: false, synced: [], errors: ['未登录'] }
  }

  const localSnapshot = getLocalSnapshot(userStore)
  const synced: string[] = []
  const errors: string[] = []
  const conflicts: ConflictInfo[] = []

  try {
    // 获取云端数据
    const [cloudProfile, cloudProgress] = await Promise.all([
      getUserProfile(userId),
      getUserProgress(userId),
    ])

    const cloudSnapshot = {
      profile: cloudProfile,
      progress: cloudProgress,
    }

    // 检测冲突
    const detected = detectConflicts(localSnapshot, cloudSnapshot)
    const resolved = resolveConflicts(detected, 'latestWins')
    conflicts.push(...resolved)

    // 应用解决方案
    for (const c of resolved) {
      if (c.module === 'progress' && c.field === 'currentDay') {
        const winner = c.resolution === 'local' ? c.localValue : c.cloudValue
        userStore.userData.currentDay = winner
      }
      if (c.module === 'progress' && c.field === 'totalPoints') {
        const winner = c.resolution === 'local' ? c.localValue : c.cloudValue
        userStore.userData.totalPoints = winner
      }
    }

    // 合并后推送到云端
    await updateUserProgress(userId, {
      currentDay: userStore.userData.currentDay,
      consecutiveDays: userStore.userData.consecutiveDays,
      lastCompletedDate: userStore.userData.lastCompletedDate,
      totalPoints: userStore.userData.totalPoints,
      usedPoints: userStore.userData.usedPoints,
    })

    synced.push('progress')
  } catch (e) {
    errors.push(`merge: ${e instanceof Error ? e.message : '合并失败'}`)
  }

  return {
    success: errors.length === 0,
    synced,
    errors,
    conflicts,
  }
}

export async function fullSync(direction: SyncDirection = 'merge'): Promise<SyncResult> {
  if (direction === 'toCloud') {
    return syncToCloud()
  } else if (direction === 'fromCloud') {
    return syncFromCloud()
  } else {
    return mergeSync()
  }
}
