import { supabaseClient } from '@/services/supabase/client'
import type { MembershipTier } from './user.api'

export interface GameRecord {
  id: string
  userId: string
  gameType: string
  date: string
  totalTimeMs: number
  completed: boolean
}

export interface GameType {
  id: string
  name: string
  description?: string | null
  requiredMembership: MembershipTier
  requiredLevel: number
  isActive: boolean
  sortOrder: number
}

function mapRecord(row: any): GameRecord {
  return {
    id: row.id,
    userId: row.user_id,
    gameType: row.game_type,
    date: row.date,
    totalTimeMs: row.total_time_ms,
    completed: row.completed,
  }
}

function mapGameType(row: any): GameType {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    requiredMembership: row.required_membership,
    requiredLevel: row.required_level,
    isActive: row.is_active,
    sortOrder: row.sort_order,
  }
}

export async function saveGameRecord(payload: Omit<GameRecord, 'id'>) {
  const { data, error } = await supabaseClient
    .from('game_records')
    .upsert(
      {
        user_id: payload.userId,
        game_type: payload.gameType,
        date: payload.date,
        total_time_ms: payload.totalTimeMs,
        completed: payload.completed,
      },
      { onConflict: 'user_id,game_type,date' },
    )
    .select()
    .maybeSingle()

  if (error) throw new Error(`保存游戏记录失败：${error.message}`)
  return data ? mapRecord(data) : null
}

export async function getGameRecords(userId: string) {
  const { data, error } = await supabaseClient
    .from('game_records')
    .select('id, user_id, game_type, date, total_time_ms, completed')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (error) throw new Error(`获取游戏记录失败：${error.message}`)
  return (data || []).map(mapRecord)
}

export async function getGameRecord(userId: string, gameType: string, date: string) {
  const { data, error } = await supabaseClient
    .from('game_records')
    .select('id, user_id, game_type, date, total_time_ms, completed')
    .eq('user_id', userId)
    .eq('game_type', gameType)
    .eq('date', date)
    .maybeSingle()

  if (error) throw new Error(`获取游戏记录失败：${error.message}`)
  return data ? mapRecord(data) : null
}

export async function getAvailableGames(userMembership: { tier: MembershipTier; level: number }) {
  const { data, error } = await supabaseClient
    .from('game_types')
    .select('id, name, description, required_membership, required_level, is_active, sort_order')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) throw new Error(`获取游戏列表失败：${error.message}`)

  return (data || [])
    .map(mapGameType)
    .filter((g) => {
      if (userMembership.tier === 'premium') return true
      return g.requiredMembership === 'free' && userMembership.level >= g.requiredLevel
    })
}

export async function upsertGameType(payload: Partial<GameType> & { id: string }) {
  const { data, error } = await supabaseClient
    .from('game_types')
    .upsert(
      {
        id: payload.id,
        name: payload.name,
        description: payload.description,
        required_membership: payload.requiredMembership,
        required_level: payload.requiredLevel,
        is_active: payload.isActive,
        sort_order: payload.sortOrder,
      },
      { onConflict: 'id' },
    )
    .select()
    .maybeSingle()

  if (error) throw new Error(`更新游戏类型失败：${error.message}`)
  return data ? mapGameType(data) : null
}

// 默认练习→游戏比例（分钟）
const DEFAULT_PRACTICE_PER_SLOT = 30
const DEFAULT_PLAY_PER_SLOT = 30
const SESSION_LIMIT_MS = 30 * 60 * 1000

interface PlayTimeConfig {
  practicePerSlotMinutes: number
  playPerSlotMinutes: number
  maxDailyPlayMinutes: number | null
}

async function getPlayTimeConfig(userId: string): Promise<PlayTimeConfig> {
  const { data } = await supabaseClient
    .from('parent_student_relations')
    .select('practice_per_slot_minutes, play_per_slot_minutes, max_daily_play_minutes')
    .eq('student_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return {
    practicePerSlotMinutes: data?.practice_per_slot_minutes ?? DEFAULT_PRACTICE_PER_SLOT,
    playPerSlotMinutes: data?.play_per_slot_minutes ?? DEFAULT_PLAY_PER_SLOT,
    maxDailyPlayMinutes: data?.max_daily_play_minutes ?? null,
  }
}

export async function getAvailablePlayMinutes(userId: string, date: string) {
  const config = await getPlayTimeConfig(userId)

  // 获取当日练习时长（exercise_records.total_time_ms）
  const { data: exerciseRow } = await supabaseClient
    .from('exercise_records')
    .select('total_time_ms')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle()

  const practiceMs = exerciseRow?.total_time_ms ?? 0
  const practiceMinutes = Math.floor(practiceMs / (60 * 1000))

  // 获取当日已游戏时长（所有 game_records 求和）
  const { data: gameRows } = await supabaseClient
    .from('game_records')
    .select('total_time_ms')
    .eq('user_id', userId)
    .eq('date', date)

  const playedMs = (gameRows ?? []).reduce((sum, r) => sum + (r.total_time_ms ?? 0), 0)
  const playedMinutes = Math.floor(playedMs / (60 * 1000))

  // 计算可玩时长
  const slotsEarned = Math.floor(practiceMinutes / config.practicePerSlotMinutes)
  let earnedPlayMinutes = slotsEarned * config.playPerSlotMinutes

  // 应用每日上限
  if (config.maxDailyPlayMinutes !== null) {
    earnedPlayMinutes = Math.min(earnedPlayMinutes, config.maxDailyPlayMinutes)
  }

  const availableMinutes = Math.max(0, earnedPlayMinutes - playedMinutes)
  return {
    availableMinutes,
    playedMinutes,
    earnedPlayMinutes,
    config,
  }
}

export interface CanStartGameResult {
  allowed: boolean
  reason?: string
  availableMs?: number
}

export async function canStartGame(
  userId: string,
  date: string,
  role: 'student' | 'parent',
  membershipTier: MembershipTier,
  exerciseCompleted: boolean,
): Promise<CanStartGameResult> {
  // 家长或 premium 无限制
  if (role === 'parent' || membershipTier === 'premium') {
    return { allowed: true }
  }

  // 学生需完成当日练习
  if (!exerciseCompleted) {
    return { allowed: false, reason: '请先完成当日练习' }
  }

  const { availableMinutes } = await getAvailablePlayMinutes(userId, date)
  if (availableMinutes <= 0) {
    return { allowed: false, reason: '当日游戏时长已用尽' }
  }

  // 单次会话上限 30 分钟与剩余时间取较小
  const availableMs = Math.min(availableMinutes * 60 * 1000, SESSION_LIMIT_MS)
  return { allowed: true, availableMs }
}

