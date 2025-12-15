import type { AchievementDef, UserStats, UnlockedAchievement } from '@/types'

// 所有成就定义
export const ACHIEVEMENTS: AchievementDef[] = [
  // 坚持类
  {
    id: 'first_day',
    name: '初次尝试',
    description: '完成第一天练习',
    icon: '🌟',
    condition: (stats) => stats.currentDay >= 1,
  },
  {
    id: 'week_streak',
    name: '一周坚持',
    description: '连续练习7天',
    icon: '🔥',
    condition: (stats) => stats.consecutiveDays >= 7,
  },
  {
    id: 'two_week_streak',
    name: '两周达人',
    description: '连续练习14天',
    icon: '💪',
    condition: (stats) => stats.consecutiveDays >= 14,
  },
  {
    id: 'month_master',
    name: '月度达人',
    description: '连续练习30天',
    icon: '👑',
    condition: (stats) => stats.consecutiveDays >= 30,
  },
  {
    id: 'hundred_days',
    name: '百日传奇',
    description: '连续练习100天',
    icon: '🏆',
    condition: (stats) => stats.consecutiveDays >= 100,
  },
  
  // 准确率类
  {
    id: 'perfect_day',
    name: '完美一天',
    description: '单日准确率达到100%',
    icon: '💯',
    condition: (stats) => stats.todayAccuracy >= 1,
  },
  {
    id: 'accuracy_master',
    name: '精准大师',
    description: '累计准确率达到95%以上',
    icon: '🎯',
    condition: (stats) => stats.overallAccuracy >= 0.95 && stats.totalChars >= 1000,
  },
  {
    id: 'ten_perfect_days',
    name: '十全十美',
    description: '累计10天准确率100%',
    icon: '✨',
    condition: (stats) => stats.perfectDays >= 10,
  },
  
  // 速度类
  {
    id: 'speed_demon',
    name: '闪电手指',
    description: '平均反应时间低于500ms',
    icon: '⚡',
    condition: (stats) => stats.avgResponseTime > 0 && stats.avgResponseTime <= 500 && stats.totalChars >= 100,
  },
  {
    id: 'lightning_fast',
    name: '神速打字',
    description: '平均反应时间低于300ms',
    icon: '🚀',
    condition: (stats) => stats.avgResponseTime > 0 && stats.avgResponseTime <= 300 && stats.totalChars >= 500,
  },
  
  // 里程碑类
  {
    id: 'hundred_chars',
    name: '百字小试',
    description: '累计输入100个字符',
    icon: '📝',
    condition: (stats) => stats.totalChars >= 100,
  },
  {
    id: 'thousand_chars',
    name: '千字达人',
    description: '累计输入1000个字符',
    icon: '📖',
    condition: (stats) => stats.totalChars >= 1000,
  },
  {
    id: 'five_thousand',
    name: '五千高手',
    description: '累计输入5000个字符',
    icon: '📚',
    condition: (stats) => stats.totalChars >= 5000,
  },
  {
    id: 'ten_thousand',
    name: '万字大师',
    description: '累计输入10000个字符',
    icon: '🎓',
    condition: (stats) => stats.totalChars >= 10000,
  },
  {
    id: 'fifty_thousand',
    name: '五万专家',
    description: '累计输入50000个字符',
    icon: '🏅',
    condition: (stats) => stats.totalChars >= 50000,
  },
  {
    id: 'hundred_thousand',
    name: '十万宗师',
    description: '累计输入100000个字符',
    icon: '👨‍🎓',
    condition: (stats) => stats.totalChars >= 100000,
  },
]

// 检查新解锁的成就
export function checkNewAchievements(
  stats: UserStats,
  unlockedIds: string[]
): AchievementDef[] {
  const newAchievements: AchievementDef[] = []
  
  for (const achievement of ACHIEVEMENTS) {
    // 跳过已解锁的
    if (unlockedIds.includes(achievement.id)) {
      continue
    }
    
    // 检查是否满足条件
    if (achievement.condition(stats)) {
      newAchievements.push(achievement)
    }
  }
  
  return newAchievements
}

// 获取成就定义
export function getAchievementDef(id: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find(a => a.id === id)
}

// 获取成就进度（用于显示）
export function getAchievementProgress(
  achievement: AchievementDef,
  stats: UserStats
): { current: number; target: number; percentage: number } | null {
  // 根据成就类型返回进度
  switch (achievement.id) {
    case 'first_day':
      return { current: stats.currentDay, target: 1, percentage: Math.min(100, stats.currentDay * 100) }
    case 'week_streak':
      return { current: stats.consecutiveDays, target: 7, percentage: Math.min(100, (stats.consecutiveDays / 7) * 100) }
    case 'two_week_streak':
      return { current: stats.consecutiveDays, target: 14, percentage: Math.min(100, (stats.consecutiveDays / 14) * 100) }
    case 'month_master':
      return { current: stats.consecutiveDays, target: 30, percentage: Math.min(100, (stats.consecutiveDays / 30) * 100) }
    case 'hundred_days':
      return { current: stats.consecutiveDays, target: 100, percentage: Math.min(100, (stats.consecutiveDays / 100) * 100) }
    case 'hundred_chars':
      return { current: stats.totalChars, target: 100, percentage: Math.min(100, (stats.totalChars / 100) * 100) }
    case 'thousand_chars':
      return { current: stats.totalChars, target: 1000, percentage: Math.min(100, (stats.totalChars / 1000) * 100) }
    case 'five_thousand':
      return { current: stats.totalChars, target: 5000, percentage: Math.min(100, (stats.totalChars / 5000) * 100) }
    case 'ten_thousand':
      return { current: stats.totalChars, target: 10000, percentage: Math.min(100, (stats.totalChars / 10000) * 100) }
    case 'fifty_thousand':
      return { current: stats.totalChars, target: 50000, percentage: Math.min(100, (stats.totalChars / 50000) * 100) }
    case 'hundred_thousand':
      return { current: stats.totalChars, target: 100000, percentage: Math.min(100, (stats.totalChars / 100000) * 100) }
    case 'ten_perfect_days':
      return { current: stats.perfectDays, target: 10, percentage: Math.min(100, (stats.perfectDays / 10) * 100) }
    default:
      return null
  }
}

