import { supabaseClient } from '@/services/supabase/client'

export interface ExerciseRecord {
  id: string
  userId: string
  day: number
  date: string
  totalChars: number
  correctChars: number
  totalTimeMs: number
  earnedPoints: number
  accuracy: number
  avgResponseTimeMs: number
}

export interface LetterStatRow {
  id: string
  userId: string
  letter: string
  totalAttempts: number
  correctAttempts: number
  totalResponseTimeMs: number
}

function mapRecord(row: any): ExerciseRecord {
  return {
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
  }
}

function mapLetter(row: any): LetterStatRow {
  return {
    id: row.id,
    userId: row.user_id,
    letter: row.letter,
    totalAttempts: row.total_attempts,
    correctAttempts: row.correct_attempts,
    totalResponseTimeMs: row.total_response_time_ms,
  }
}

export async function saveExerciseRecord(payload: Omit<ExerciseRecord, 'id'>) {
  const { data, error } = await supabaseClient
    .from('exercise_records')
    .upsert(
      {
        user_id: payload.userId,
        day: payload.day,
        date: payload.date,
        total_chars: payload.totalChars,
        correct_chars: payload.correctChars,
        total_time_ms: payload.totalTimeMs,
        earned_points: payload.earnedPoints,
        accuracy: payload.accuracy,
        avg_response_time_ms: payload.avgResponseTimeMs,
      },
      { onConflict: 'user_id,date' },
    )
    .select()
    .maybeSingle()

  if (error) throw new Error(`保存练习记录失败：${error.message}`)
  return data ? mapRecord(data) : null
}

export async function getExerciseRecords(userId: string) {
  const { data, error } = await supabaseClient
    .from('exercise_records')
    .select(
      'id, user_id, day, date, total_chars, correct_chars, total_time_ms, earned_points, accuracy, avg_response_time_ms',
    )
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (error) throw new Error(`获取练习记录失败：${error.message}`)
  return (data || []).map(mapRecord)
}

export async function batchUpdateLetterStats(userId: string, stats: Array<Omit<LetterStatRow, 'id' | 'userId'>>) {
  const payload = stats.map((s) => ({
    user_id: userId,
    letter: s.letter,
    total_attempts: s.totalAttempts,
    correct_attempts: s.correctAttempts,
    total_response_time_ms: s.totalResponseTimeMs,
  }))

  const { error } = await supabaseClient.from('letter_stats').upsert(payload, { onConflict: 'user_id,letter' })
  if (error) throw new Error(`更新字母统计失败：${error.message}`)
}

export async function getLetterStats(userId: string) {
  const { data, error } = await supabaseClient
    .from('letter_stats')
    .select('id, user_id, letter, total_attempts, correct_attempts, total_response_time_ms')
    .eq('user_id', userId)

  if (error) throw new Error(`获取字母统计失败：${error.message}`)
  return (data || []).map(mapLetter)
}

