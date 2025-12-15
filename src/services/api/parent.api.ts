import { supabaseClient } from '@/services/supabase/client'
import type { UserProfile, UserProgress } from './user.api'
import type { ExerciseRecord } from './exercise.api'
import type { GameRecord } from './game.api'

export interface ParentStudentRelation {
  id: string
  parentId: string
  studentId: string
  practicePerSlotMinutes: number
  playPerSlotMinutes: number
  maxDailyPlayMinutes: number | null
  createdAt: string
}

export interface StudentInfo {
  id: string
  accountName: string
  nickname: string
  email: string
  level: number
}

function mapRelation(row: any): ParentStudentRelation {
  return {
    id: row.id,
    parentId: row.parent_id,
    studentId: row.student_id,
    practicePerSlotMinutes: row.practice_per_slot_minutes,
    playPerSlotMinutes: row.play_per_slot_minutes,
    maxDailyPlayMinutes: row.max_daily_play_minutes,
    createdAt: row.created_at,
  }
}

function mapStudent(row: any): StudentInfo {
  return {
    id: row.id,
    accountName: row.account_name,
    nickname: row.nickname,
    email: row.email,
    level: row.level,
  }
}

export async function getUserRole(userId: string) {
  const { data, error } = await supabaseClient
    .from('user_profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw new Error(`获取用户角色失败：${error.message}`)
  return (data?.role as 'student' | 'parent') ?? 'student'
}

export async function updateUserRole(userId: string, role: 'student' | 'parent') {
  const { error } = await supabaseClient
    .from('user_profiles')
    .update({ role })
    .eq('id', userId)

  if (error) throw new Error(`更新用户角色失败：${error.message}`)
}

export async function getStudentList(parentId: string) {
  // 先获取关联关系
  const { data: relations, error: relError } = await supabaseClient
    .from('parent_student_relations')
    .select('id, parent_id, student_id, practice_per_slot_minutes, play_per_slot_minutes, max_daily_play_minutes, created_at')
    .eq('parent_id', parentId)

  if (relError) throw new Error(`获取学生列表失败：${relError.message}`)
  if (!relations || relations.length === 0) return []

  // 获取学生信息
  const studentIds = relations.map(r => r.student_id)
  const { data: students, error: stuError } = await supabaseClient
    .from('user_profiles')
    .select('id, account_name, nickname, email, level')
    .in('id', studentIds)

  if (stuError) throw new Error(`获取学生信息失败：${stuError.message}`)

  const studentMap = new Map((students || []).map(s => [s.id, s]))

  return relations.map((row: any) => ({
    relation: mapRelation(row),
    student: studentMap.has(row.student_id) ? mapStudent(studentMap.get(row.student_id)) : null,
  }))
}

export async function addStudentRelationByInviteCode(parentId: string, inviteCode: string) {
  // 先查找学生
  const { data: student, error: findError } = await supabaseClient
    .from('user_profiles')
    .select('id, role')
    .eq('invite_code', inviteCode)
    .maybeSingle()

  if (findError) throw new Error(`查询学生失败：${findError.message}`)
  if (!student) throw new Error('邀请码无效或未找到学生')
  if (student.role !== 'student') throw new Error('该账户不是学生账户')
  if (student.id === parentId) throw new Error('不能绑定自己')

  // 检查学生是否已被其他家长绑定
  const { data: existingBinding } = await supabaseClient
    .from('parent_student_relations')
    .select('id, parent_id')
    .eq('student_id', student.id)
    .maybeSingle()

  if (existingBinding) {
    if (existingBinding.parent_id === parentId) {
      throw new Error('该学生已被您绑定')
    } else {
      throw new Error('该学生已被其他家长绑定')
    }
  }

  const { data, error } = await supabaseClient
    .from('parent_student_relations')
    .insert({ parent_id: parentId, student_id: student.id })
    .select()
    .maybeSingle()

  if (error) throw new Error(`绑定学生失败：${error.message}`)
  return data ? mapRelation(data) : null
}

export async function addStudentRelationByAccountName(parentId: string, accountName: string) {
  const { data: student, error: findError } = await supabaseClient
    .from('user_profiles')
    .select('id, role')
    .eq('account_name', accountName)
    .maybeSingle()

  if (findError) throw new Error(`查询学生失败：${findError.message}`)
  if (!student) throw new Error('未找到该账户名')
  if (student.role !== 'student') throw new Error('该账户不是学生账户')
  if (student.id === parentId) throw new Error('不能绑定自己')

  // 检查学生是否已被其他家长绑定
  const { data: existingBinding } = await supabaseClient
    .from('parent_student_relations')
    .select('id, parent_id')
    .eq('student_id', student.id)
    .maybeSingle()

  if (existingBinding) {
    if (existingBinding.parent_id === parentId) {
      throw new Error('该学生已被您绑定')
    } else {
      throw new Error('该学生已被其他家长绑定')
    }
  }

  const { data, error } = await supabaseClient
    .from('parent_student_relations')
    .insert({ parent_id: parentId, student_id: student.id })
    .select()
    .maybeSingle()

  if (error) throw new Error(`绑定学生失败：${error.message}`)
  return data ? mapRelation(data) : null
}

export async function removeStudentRelation(parentId: string, studentId: string) {
  const { error } = await supabaseClient
    .from('parent_student_relations')
    .delete()
    .eq('parent_id', parentId)
    .eq('student_id', studentId)

  if (error) throw new Error(`解除绑定失败：${error.message}`)
}

export async function getStudentProgress(parentId: string, studentId: string) {
  // 验证关联关系
  const { data: relation } = await supabaseClient
    .from('parent_student_relations')
    .select('id')
    .eq('parent_id', parentId)
    .eq('student_id', studentId)
    .maybeSingle()

  if (!relation) throw new Error('无权访问该学生数据')

  const { data, error } = await supabaseClient
    .from('user_progress')
    .select('user_id, current_day, consecutive_days, last_completed_date, total_points, used_points, updated_at')
    .eq('user_id', studentId)
    .maybeSingle()

  if (error) throw new Error(`获取学生进度失败：${error.message}`)
  if (!data) return null

  return {
    userId: data.user_id,
    currentDay: data.current_day,
    consecutiveDays: data.consecutive_days,
    lastCompletedDate: data.last_completed_date,
    totalPoints: data.total_points,
    usedPoints: data.used_points,
    updatedAt: data.updated_at,
  } as UserProgress
}

export async function getStudentExerciseRecords(parentId: string, studentId: string) {
  const { data: relation } = await supabaseClient
    .from('parent_student_relations')
    .select('id')
    .eq('parent_id', parentId)
    .eq('student_id', studentId)
    .maybeSingle()

  if (!relation) throw new Error('无权访问该学生数据')

  const { data, error } = await supabaseClient
    .from('exercise_records')
    .select('id, user_id, day, date, total_chars, correct_chars, total_time_ms, earned_points, accuracy, avg_response_time_ms')
    .eq('user_id', studentId)
    .order('date', { ascending: false })

  if (error) throw new Error(`获取学生练习记录失败：${error.message}`)

  return (data || []).map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    day: row.day,
    date: row.date,
    totalChars: row.total_chars,
    correctChars: row.correct_chars,
    totalTimeMs: row.total_time_ms,
    earnedPoints: row.earned_points,
    accuracy: Number(row.accuracy),
    avgResponseTimeMs: Number(row.avg_response_time_ms),
  })) as ExerciseRecord[]
}

export async function getStudentGameRecords(parentId: string, studentId: string) {
  const { data: relation } = await supabaseClient
    .from('parent_student_relations')
    .select('id')
    .eq('parent_id', parentId)
    .eq('student_id', studentId)
    .maybeSingle()

  if (!relation) throw new Error('无权访问该学生数据')

  const { data, error } = await supabaseClient
    .from('game_records')
    .select('id, user_id, game_type, date, total_time_ms, completed')
    .eq('user_id', studentId)
    .order('date', { ascending: false })

  if (error) throw new Error(`获取学生游戏记录失败：${error.message}`)

  return (data || []).map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    gameType: row.game_type,
    date: row.date,
    totalTimeMs: row.total_time_ms,
    completed: row.completed,
  })) as GameRecord[]
}

export async function updatePracticePlayRatio(
  parentId: string,
  studentId: string,
  practiceMinutes: number,
  playMinutes: number,
  maxDailyMinutes?: number | null,
) {
  const { data: relation } = await supabaseClient
    .from('parent_student_relations')
    .select('id')
    .eq('parent_id', parentId)
    .eq('student_id', studentId)
    .maybeSingle()

  if (!relation) throw new Error('关联关系不存在')

  const { error } = await supabaseClient
    .from('parent_student_relations')
    .update({
      practice_per_slot_minutes: practiceMinutes,
      play_per_slot_minutes: playMinutes,
      max_daily_play_minutes: maxDailyMinutes ?? null,
    })
    .eq('id', relation.id)

  if (error) throw new Error(`更新练习游戏比例失败：${error.message}`)
}

export async function getPracticePlayRatio(studentId: string) {
  const { data } = await supabaseClient
    .from('parent_student_relations')
    .select('practice_per_slot_minutes, play_per_slot_minutes, max_daily_play_minutes')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return {
    practicePerSlotMinutes: data?.practice_per_slot_minutes ?? 30,
    playPerSlotMinutes: data?.play_per_slot_minutes ?? 30,
    maxDailyPlayMinutes: data?.max_daily_play_minutes ?? null,
  }
}
