import { supabaseClient } from '@/services/supabase/client'

export interface PointsTransaction {
  id: string
  userId: string
  delta: number
  reason: string | null
  createdAt: string
}

function mapTx(row: any): PointsTransaction {
  return {
    id: row.id,
    userId: row.user_id,
    delta: row.delta,
    reason: row.reason,
    createdAt: row.created_at,
  }
}

export async function getUserPoints(userId: string) {
  const { data, error } = await supabaseClient
    .from('points_transactions')
    .select('delta')
    .eq('user_id', userId)

  if (error) throw new Error(`获取积分失败：${error.message}`)
  const total = (data || []).reduce((sum, row) => sum + (row.delta || 0), 0)
  return total
}

export async function addPoints(userId: string, delta: number, reason?: string) {
  const { data, error } = await supabaseClient
    .from('points_transactions')
    .insert({ user_id: userId, delta: Math.abs(delta), reason })
    .select()
    .maybeSingle()

  if (error) throw new Error(`增加积分失败：${error.message}`)
  return data ? mapTx(data) : null
}

export async function deductPoints(userId: string, delta: number, reason?: string) {
  const { data, error } = await supabaseClient
    .from('points_transactions')
    .insert({ user_id: userId, delta: -Math.abs(delta), reason })
    .select()
    .maybeSingle()

  if (error) throw new Error(`扣减积分失败：${error.message}`)
  return data ? mapTx(data) : null
}

export async function getPointsHistory(userId: string) {
  const { data, error } = await supabaseClient
    .from('points_transactions')
    .select('id, user_id, delta, reason, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`获取积分流水失败：${error.message}`)
  return (data || []).map(mapTx)
}

