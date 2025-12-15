import { supabaseClient } from '@/services/supabase/client'

export type MembershipTier = 'free' | 'premium'

export interface UserProfile {
  id: string
  accountName: string
  nickname: string
  email: string
  role: 'student' | 'parent'
  inviteCode: string | null
  membershipTier: MembershipTier
  membershipExpiresAt: string | null
  level: number
  avatarUrl: string | null
  soundEnabled: boolean | null
}

export interface UserProgress {
  userId: string
  currentDay: number
  consecutiveDays: number
  lastCompletedDate: string | null
  totalPoints: number
  usedPoints: number
  updatedAt: string | null
}

const DEFAULT_PROGRESS: Omit<UserProgress, 'userId'> = {
  currentDay: 1,
  consecutiveDays: 0,
  lastCompletedDate: null,
  totalPoints: 0,
  usedPoints: 0,
  updatedAt: null,
}

function mapProfile(row: any): UserProfile {
  return {
    id: row.id,
    accountName: row.account_name,
    nickname: row.nickname,
    email: row.email,
    role: row.role,
    inviteCode: row.invite_code,
    membershipTier: row.membership_tier,
    membershipExpiresAt: row.membership_expires_at,
    level: row.level,
    avatarUrl: row.avatar_url,
    soundEnabled: row.sound_enabled,
  }
}

function mapProgress(row: any): UserProgress {
  return {
    userId: row.user_id,
    currentDay: row.current_day,
    consecutiveDays: row.consecutive_days,
    lastCompletedDate: row.last_completed_date,
    totalPoints: row.total_points,
    usedPoints: row.used_points,
    updatedAt: row.updated_at,
  }
}

export async function checkAccountNameExists(accountName: string) {
  const { error, count } = await supabaseClient
    .from('user_profiles')
    .select('id', { head: true, count: 'exact' })
    .eq('account_name', accountName)

  if (error) {
    throw new Error(`检查账户名失败：${error.message}`)
  }

  return (count ?? 0) > 0
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabaseClient
    .from('user_profiles')
    .select(
      'id, account_name, nickname, email, role, invite_code, membership_tier, membership_expires_at, level, avatar_url, sound_enabled',
    )
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw new Error(`获取用户资料失败：${error.message}`)
  }

  return data ? mapProfile(data) : null
}

export async function updateUserProfile(userId: string, payload: Partial<Omit<UserProfile, 'id'>>) {
  const updatePayload = {
    id: userId,
    account_name: payload.accountName,
    nickname: payload.nickname,
    email: payload.email,
    role: payload.role,
    invite_code: payload.inviteCode,
    membership_tier: payload.membershipTier,
    membership_expires_at: payload.membershipExpiresAt,
    level: payload.level,
    avatar_url: payload.avatarUrl,
    sound_enabled: payload.soundEnabled,
  }

  const { data, error } = await supabaseClient
    .from('user_profiles')
    .upsert(updatePayload, { onConflict: 'id' })
    .select()
    .maybeSingle()

  if (error) {
    throw new Error(`更新用户资料失败：${error.message}`)
  }

  return data ? mapProfile(data) : null
}

export async function getInviteCode(userId: string) {
  const { data, error } = await supabaseClient
    .from('user_profiles')
    .select('invite_code')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw new Error(`获取邀请码失败：${error.message}`)
  }

  return data?.invite_code ?? null
}

export async function getBoundParents(userId: string) {
  const { data, error } = await supabaseClient
    .from('parent_student_relations')
    .select(`
      parent_id,
      user_profiles!parent_student_relations_parent_id_fkey (
        id,
        account_name,
        nickname
      )
    `)
    .eq('student_id', userId)

  if (error) {
    throw new Error(`获取绑定家长失败：${error.message}`)
  }

  return (data || []).map((row: any) => ({
    id: row.user_profiles?.id ?? row.parent_id,
    accountName: row.user_profiles?.account_name ?? '',
    nickname: row.user_profiles?.nickname ?? '',
  }))
}

export async function getUserMembership(userId: string) {
  const profile = await getUserProfile(userId)
  if (!profile) return null

  const isExpired =
    profile.membershipTier === 'premium' &&
    profile.membershipExpiresAt &&
    new Date(profile.membershipExpiresAt).getTime() < Date.now()

  return {
    membershipTier: isExpired ? ('free' as MembershipTier) : profile.membershipTier,
    membershipExpiresAt: profile.membershipExpiresAt,
    level: profile.level,
  }
}

export async function updateMembership(userId: string, tier: MembershipTier, expiresAt: string | null) {
  const result = await updateUserProfile(userId, {
    membershipTier: tier,
    membershipExpiresAt: expiresAt,
  })
  return result
}

export async function updateUserLevel(userId: string, level: number) {
  const result = await updateUserProfile(userId, { level })
  return result
}

export async function getUserProgress(userId: string) {
  const { data, error } = await supabaseClient
    .from('user_progress')
    .select('user_id, current_day, consecutive_days, last_completed_date, total_points, used_points, updated_at')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    throw new Error(`获取用户进度失败：${error.message}`)
  }

  if (!data) {
    const defaultRow = { user_id: userId, ...DEFAULT_PROGRESS }
    const { data: inserted, error: insertError } = await supabaseClient
      .from('user_progress')
      .upsert(defaultRow, { onConflict: 'user_id' })
      .select()
      .maybeSingle()

    if (insertError) {
      throw new Error(`初始化用户进度失败：${insertError.message}`)
    }
    return inserted ? mapProgress(inserted) : null
  }

  return mapProgress(data)
}

export async function updateUserProgress(userId: string, payload: Partial<Omit<UserProgress, 'userId'>>) {
  const updatePayload = {
    user_id: userId,
    current_day: payload.currentDay,
    consecutive_days: payload.consecutiveDays,
    last_completed_date: payload.lastCompletedDate,
    total_points: payload.totalPoints,
    used_points: payload.usedPoints,
  }

  const { data, error } = await supabaseClient
    .from('user_progress')
    .upsert(updatePayload, { onConflict: 'user_id' })
    .select()
    .maybeSingle()

  if (error) {
    throw new Error(`更新用户进度失败：${error.message}`)
  }

  return data ? mapProgress(data) : null
}

