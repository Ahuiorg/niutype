import { supabaseClient } from '@/services/supabase/client'

export interface AchievementRow {
  id: string
  userId: string
  achievementId: string
  unlockedAt: string
}

function mapRow(row: any): AchievementRow {
  return {
    id: row.id,
    userId: row.user_id,
    achievementId: row.achievement_id,
    unlockedAt: row.unlocked_at,
  }
}

export async function unlockAchievement(userId: string, achievementId: string) {
  const { data, error } = await supabaseClient
    .from('achievements')
    .upsert(
      { user_id: userId, achievement_id: achievementId },
      { onConflict: 'user_id,achievement_id' },
    )
    .select()
    .maybeSingle()

  if (error) throw new Error(`解锁成就失败：${error.message}`)
  return data ? mapRow(data) : null
}

export async function getUserAchievements(userId: string) {
  const { data, error } = await supabaseClient
    .from('achievements')
    .select('id, user_id, achievement_id, unlocked_at')
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false })

  if (error) throw new Error(`获取成就失败：${error.message}`)
  return (data || []).map(mapRow)
}

export async function isAchievementUnlocked(userId: string, achievementId: string) {
  const { data, error } = await supabaseClient
    .from('achievements')
    .select('id')
    .eq('user_id', userId)
    .eq('achievement_id', achievementId)
    .maybeSingle()

  if (error) throw new Error(`检查成就失败：${error.message}`)
  return !!data
}

