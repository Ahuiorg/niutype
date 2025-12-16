import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import {
  updateUserProfile,
  updateUserProgress,
} from '@/services/api/user.api'
import {
  saveExerciseRecord,
  batchUpdateLetterStats,
} from '@/services/api/exercise.api'
import { addPoints } from '@/services/api/points.api'
import { unlockAchievement } from '@/services/api/achievement.api'

const LOCAL_STORAGE_KEY = 'niutype:userData'
const MIGRATION_FLAG_KEY = 'niutype:migrationCompleted'

export interface OldLocalData {
  currentDay: number
  consecutiveDays: number
  lastCompletedDate: string | null
  lastActiveDate: string
  totalPoints: number
  usedPoints: number
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
  achievements: string[]
  redeemedGifts: Array<{ giftId: string; redeemedAt: string; pointsSpent: number }>
  settings: {
    nickname: string
    soundEnabled: boolean
  }
}

export interface MigrationResult {
  success: boolean
  migratedModules: string[]
  errors: string[]
  skipped: string[]
}

export function detectOldData(): OldLocalData | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!raw) return null

    const data = JSON.parse(raw)
    // 验证基本结构
    if (
      typeof data.currentDay !== 'number' ||
      typeof data.letterStats !== 'object'
    ) {
      return null
    }

    return data as OldLocalData
  } catch {
    return null
  }
}

export function isMigrationCompleted(): boolean {
  return localStorage.getItem(MIGRATION_FLAG_KEY) === 'true'
}

export function markMigrationCompleted() {
  localStorage.setItem(MIGRATION_FLAG_KEY, 'true')
}

export function clearMigrationFlag() {
  localStorage.removeItem(MIGRATION_FLAG_KEY)
}

export function validateData(data: OldLocalData): { valid: boolean; issues: string[] } {
  const issues: string[] = []

  if (data.currentDay < 1) {
    issues.push('currentDay 必须 >= 1')
  }

  if (data.totalPoints < 0) {
    issues.push('totalPoints 不能为负数')
  }

  if (data.usedPoints < 0) {
    issues.push('usedPoints 不能为负数')
  }

  if (data.usedPoints > data.totalPoints) {
    issues.push('usedPoints 不能大于 totalPoints')
  }

  // 验证字母统计
  const validLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  for (const letter of Object.keys(data.letterStats)) {
    if (!validLetters.includes(letter)) {
      issues.push(`无效的字母统计键：${letter}`)
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  }
}

export async function migrateData(data: OldLocalData): Promise<MigrationResult> {
  const authStore = useAuthStore()
  const userId = authStore.session?.user?.id

  if (!userId) {
    return {
      success: false,
      migratedModules: [],
      errors: ['未登录，无法迁移'],
      skipped: [],
    }
  }

  // 验证数据
  const validation = validateData(data)
  if (!validation.valid) {
    return {
      success: false,
      migratedModules: [],
      errors: ['数据验证失败：' + validation.issues.join('; ')],
      skipped: [],
    }
  }

  const migratedModules: string[] = []
  const errors: string[] = []
  const skipped: string[] = []

  // 1. 迁移用户资料
  try {
    await updateUserProfile(userId, {
      nickname: data.settings.nickname,
      soundEnabled: data.settings.soundEnabled,
    })
    migratedModules.push('profile')
  } catch (e) {
    errors.push(`profile: ${e instanceof Error ? e.message : '迁移失败'}`)
  }

  // 2. 迁移用户进度
  try {
    await updateUserProgress(userId, {
      currentDay: data.currentDay,
      consecutiveDays: data.consecutiveDays,
      lastCompletedDate: data.lastCompletedDate,
      totalPoints: data.totalPoints,
      usedPoints: data.usedPoints,
    })
    migratedModules.push('progress')
  } catch (e) {
    errors.push(`progress: ${e instanceof Error ? e.message : '迁移失败'}`)
  }

  // 3. 迁移字母统计
  try {
    const statsArray = Object.entries(data.letterStats).map(([letter, stat]) => ({
      letter,
      totalAttempts: stat.totalAttempts,
      correctAttempts: stat.correctAttempts,
      totalResponseTimeMs: stat.totalResponseTime,
    }))
    if (statsArray.length > 0) {
      await batchUpdateLetterStats(userId, statsArray)
      migratedModules.push('letterStats')
    } else {
      skipped.push('letterStats (无数据)')
    }
  } catch (e) {
    errors.push(`letterStats: ${e instanceof Error ? e.message : '迁移失败'}`)
  }

  // 4. 迁移每日记录
  try {
    let recordCount = 0
    for (const record of data.dailyRecords) {
      try {
        await saveExerciseRecord({
          userId,
          day: record.day,
          date: record.date,
          totalChars: record.totalChars,
          correctChars: record.correctChars,
          totalTimeMs: record.totalTime,
          earnedPoints: record.earnedPoints,
          accuracy: record.accuracy,
          avgResponseTimeMs: record.avgResponseTime,
        })
        recordCount++
      } catch {
        // 单条失败继续
      }
    }
    if (recordCount > 0) {
      migratedModules.push(`dailyRecords (${recordCount}条)`)
    } else if (data.dailyRecords.length === 0) {
      skipped.push('dailyRecords (无数据)')
    } else {
      errors.push('dailyRecords: 所有记录迁移失败')
    }
  } catch (e) {
    errors.push(`dailyRecords: ${e instanceof Error ? e.message : '迁移失败'}`)
  }

  // 5. 迁移成就
  try {
    let achievementCount = 0
    for (const achievementId of data.achievements) {
      try {
        await unlockAchievement(userId, achievementId)
        achievementCount++
      } catch {
        // 可能已解锁，忽略
      }
    }
    if (achievementCount > 0) {
      migratedModules.push(`achievements (${achievementCount}个)`)
    } else if (data.achievements.length === 0) {
      skipped.push('achievements (无数据)')
    }
  } catch (e) {
    errors.push(`achievements: ${e instanceof Error ? e.message : '迁移失败'}`)
  }

  // 6. 标记迁移完成
  if (errors.length === 0) {
    markMigrationCompleted()
  }

  return {
    success: errors.length === 0,
    migratedModules,
    errors,
    skipped,
  }
}

export function clearOldData() {
  localStorage.removeItem(LOCAL_STORAGE_KEY)
}

export interface MigrationStatus {
  hasOldData: boolean
  alreadyMigrated: boolean
  oldData: OldLocalData | null
}

export function getMigrationStatus(): MigrationStatus {
  const oldData = detectOldData()
  return {
    hasOldData: oldData !== null,
    alreadyMigrated: isMigrationCompleted(),
    oldData,
  }
}



