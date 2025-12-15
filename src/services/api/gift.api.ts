import { supabaseClient } from '@/services/supabase/client'

export interface GiftItem {
  id: string
  name: string
  points: number
  imageUrl?: string | null
  description?: string | null
  isActive: boolean
  createdBy?: string | null
  studentId?: string | null
  createdAt?: string
}

export interface RedeemedGiftRow {
  id: string
  userId: string
  giftId: string
  points: number
  redeemedAt: string
  claimedAt?: string | null
  giftName?: string
}

function mapGift(row: any): GiftItem {
  return {
    id: row.id,
    name: row.name,
    points: row.points,
    imageUrl: row.image_url,
    description: row.description,
    isActive: row.is_active,
    createdBy: row.created_by,
    studentId: row.student_id,
    createdAt: row.created_at,
  }
}

function mapRedeemed(row: any): RedeemedGiftRow {
  return {
    id: row.id,
    userId: row.user_id,
    giftId: row.gift_id,
    points: row.points,
    redeemedAt: row.redeemed_at,
    claimedAt: row.claimed_at,
    giftName: row.gifts?.name,
  }
}

// 获取学生可兑换的礼物（家长为该学生创建的礼物）
export async function getGiftsForStudent(studentId: string) {
  const { data, error } = await supabaseClient
    .from('gifts')
    .select('id, name, points, image_url, description, is_active, created_by, student_id, created_at')
    .eq('student_id', studentId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (error) throw new Error(`获取礼物列表失败：${error.message}`)
  return (data || []).map(mapGift)
}

// 获取家长为特定学生创建的礼物
export async function getGiftsByParent(parentId: string, studentId: string) {
  const { data, error } = await supabaseClient
    .from('gifts')
    .select('id, name, points, image_url, description, is_active, created_by, student_id, created_at')
    .eq('created_by', parentId)
    .eq('student_id', studentId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(`获取礼物列表失败：${error.message}`)
  return (data || []).map(mapGift)
}

// 家长为学生添加礼物
export async function createGiftForStudent(
  parentId: string, 
  studentId: string, 
  name: string, 
  points: number,
  description?: string,
  imageUrl?: string
) {
  // 验证家长-学生关系
  const { data: relation } = await supabaseClient
    .from('parent_student_relations')
    .select('id')
    .eq('parent_id', parentId)
    .eq('student_id', studentId)
    .maybeSingle()

  if (!relation) throw new Error('您未绑定该学生，无法添加礼物')

  const { data, error } = await supabaseClient
    .from('gifts')
    .insert({
      name,
      points,
      description,
      image_url: imageUrl,
      created_by: parentId,
      student_id: studentId,
      is_active: true,
    })
    .select()
    .maybeSingle()

  if (error) throw new Error(`添加礼物失败：${error.message}`)
  return data ? mapGift(data) : null
}

// 家长删除礼物
export async function deleteGift(parentId: string, giftId: string) {
  const { error } = await supabaseClient
    .from('gifts')
    .delete()
    .eq('id', giftId)
    .eq('created_by', parentId)

  if (error) throw new Error(`删除礼物失败：${error.message}`)
}

// 家长更新礼物
export async function updateGift(
  parentId: string,
  giftId: string,
  updates: { name?: string; points?: number; description?: string; isActive?: boolean }
) {
  const updateData: any = {}
  if (updates.name !== undefined) updateData.name = updates.name
  if (updates.points !== undefined) updateData.points = updates.points
  if (updates.description !== undefined) updateData.description = updates.description
  if (updates.isActive !== undefined) updateData.is_active = updates.isActive

  const { data, error } = await supabaseClient
    .from('gifts')
    .update(updateData)
    .eq('id', giftId)
    .eq('created_by', parentId)
    .select()
    .maybeSingle()

  if (error) throw new Error(`更新礼物失败：${error.message}`)
  return data ? mapGift(data) : null
}

// 学生兑换礼物
export async function redeemGift(studentId: string, giftId: string) {
  // 获取礼物信息
  const { data: gift, error: giftError } = await supabaseClient
    .from('gifts')
    .select('id, points, student_id, is_active')
    .eq('id', giftId)
    .maybeSingle()

  if (giftError) throw new Error(`获取礼物失败：${giftError.message}`)
  if (!gift) throw new Error('礼物不存在')
  if (!gift.is_active) throw new Error('该礼物已下架')
  if (gift.student_id !== studentId) throw new Error('您无权兑换此礼物')

  // 检查学生积分
  const { data: progress, error: progressError } = await supabaseClient
    .from('user_progress')
    .select('total_points, used_points')
    .eq('user_id', studentId)
    .maybeSingle()

  if (progressError) throw new Error(`获取积分失败：${progressError.message}`)
  
  const availablePoints = (progress?.total_points || 0) - (progress?.used_points || 0)
  if (availablePoints < gift.points) {
    throw new Error(`积分不足，需要 ${gift.points} 积分，当前可用 ${availablePoints} 积分`)
  }

  // 创建兑换记录
  const { data: redeemed, error: redeemError } = await supabaseClient
    .from('redeemed_gifts')
    .insert({
      user_id: studentId,
      gift_id: giftId,
      points: gift.points,
    })
    .select()
    .maybeSingle()

  if (redeemError) throw new Error(`兑换礼物失败：${redeemError.message}`)

  // 更新学生已使用积分
  const newUsedPoints = (progress?.used_points || 0) + gift.points
  const { error: updateError } = await supabaseClient
    .from('user_progress')
    .update({ used_points: newUsedPoints })
    .eq('user_id', studentId)

  if (updateError) throw new Error(`更新积分失败：${updateError.message}`)

  return redeemed ? mapRedeemed(redeemed) : null
}

// 获取学生已兑换的礼物
export async function getRedeemedGifts(userId: string) {
  const { data, error } = await supabaseClient
    .from('redeemed_gifts')
    .select(`
      id, user_id, gift_id, points, redeemed_at, claimed_at,
      gifts (name)
    `)
    .eq('user_id', userId)
    .order('redeemed_at', { ascending: false })

  if (error) throw new Error(`获取已兑换礼物失败：${error.message}`)
  return (data || []).map(mapRedeemed)
}

// 家长确认学生领取礼物
export async function claimGift(parentId: string, redeemedId: string) {
  // 验证家长权限
  const { data: redeemed } = await supabaseClient
    .from('redeemed_gifts')
    .select('user_id')
    .eq('id', redeemedId)
    .maybeSingle()

  if (!redeemed) throw new Error('兑换记录不存在')

  const { data: relation } = await supabaseClient
    .from('parent_student_relations')
    .select('id')
    .eq('parent_id', parentId)
    .eq('student_id', redeemed.user_id)
    .maybeSingle()

  if (!relation) throw new Error('您无权操作此记录')

  const { error } = await supabaseClient
    .from('redeemed_gifts')
    .update({ claimed_at: new Date().toISOString() })
    .eq('id', redeemedId)

  if (error) throw new Error(`确认领取失败：${error.message}`)
}

// 学生自己确认领取（可选，根据业务需求）
export async function claimGiftByStudent(studentId: string, redeemedId: string) {
  const { error } = await supabaseClient
    .from('redeemed_gifts')
    .update({ claimed_at: new Date().toISOString() })
    .eq('id', redeemedId)
    .eq('user_id', studentId)

  if (error) throw new Error(`确认领取失败：${error.message}`)
}

// 获取礼物详情
export async function getGiftById(id: string) {
  const { data, error } = await supabaseClient
    .from('gifts')
    .select('id, name, points, image_url, description, is_active, created_by, student_id, created_at')
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Error(`获取礼物失败：${error.message}`)
  return data ? mapGift(data) : null
}

// 旧接口保持兼容
export async function getAvailableGifts() {
  const { data, error } = await supabaseClient
    .from('gifts')
    .select('id, name, points, image_url, description, is_active, created_by, student_id, created_at')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (error) throw new Error(`获取礼物列表失败：${error.message}`)
  return (data || []).map(mapGift)
}
