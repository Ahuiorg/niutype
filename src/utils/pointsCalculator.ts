import { POINTS_CONFIG } from '@/types'

export interface DayResult {
  totalChars: number
  correctChars: number
  totalTime: number
  consecutiveDays: number
}

export interface PointsBreakdown {
  base: number
  accuracyBonus: number
  speedBonus: number
  streakBonus: number
  total: number
}

// 计算积分
export function calculatePoints(result: DayResult): PointsBreakdown {
  const { totalChars, correctChars, totalTime, consecutiveDays } = result
  
  // 基础积分
  const base = POINTS_CONFIG.baseDailyPoints
  
  // 准确率
  const accuracy = totalChars > 0 ? correctChars / totalChars : 0
  let accuracyBonus = 0
  if (accuracy >= POINTS_CONFIG.accuracyBonus.high.threshold) {
    accuracyBonus = POINTS_CONFIG.accuracyBonus.high.points
  } else if (accuracy >= POINTS_CONFIG.accuracyBonus.medium.threshold) {
    accuracyBonus = POINTS_CONFIG.accuracyBonus.medium.points
  } else if (accuracy >= POINTS_CONFIG.accuracyBonus.low.threshold) {
    accuracyBonus = POINTS_CONFIG.accuracyBonus.low.points
  }
  
  // 速度（平均反应时间）
  const avgTime = totalChars > 0 ? totalTime / totalChars : Infinity
  let speedBonus = 0
  if (avgTime <= POINTS_CONFIG.speedBonus.fast.threshold) {
    speedBonus = POINTS_CONFIG.speedBonus.fast.points
  } else if (avgTime <= POINTS_CONFIG.speedBonus.medium.threshold) {
    speedBonus = POINTS_CONFIG.speedBonus.medium.points
  }
  
  // 连续打卡加成
  const streakBonus = Math.min(
    consecutiveDays * POINTS_CONFIG.streakBonusPerDay,
    POINTS_CONFIG.maxStreakBonus
  )
  
  const total = base + accuracyBonus + speedBonus + streakBonus
  
  return {
    base,
    accuracyBonus,
    speedBonus,
    streakBonus,
    total,
  }
}

// 获取准确率等级
export function getAccuracyLevel(accuracy: number): 'excellent' | 'good' | 'normal' | 'poor' {
  if (accuracy >= 0.95) return 'excellent'
  if (accuracy >= 0.9) return 'good'
  if (accuracy >= 0.8) return 'normal'
  return 'poor'
}

// 获取速度等级
export function getSpeedLevel(avgTime: number): 'fast' | 'medium' | 'slow' {
  if (avgTime <= 500) return 'fast'
  if (avgTime <= 800) return 'medium'
  return 'slow'
}

