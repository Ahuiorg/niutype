import { supabaseClient } from '@/services/supabase/client'
import type { AccountRecoveryPayload, SignUpParams, SignUpResult, UserRole } from './auth.types'

export const ACCOUNT_NAME_REGEX = /^[a-z0-9]+$/

export function validateAccountName(accountName: string) {
  return ACCOUNT_NAME_REGEX.test(accountName)
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

export async function getEmailByAccountName(accountName: string) {
  const { data, error } = await supabaseClient
    .from('user_profiles')
    .select('email')
    .eq('account_name', accountName)
    .maybeSingle()

  if (error) {
    throw new Error(`查询邮箱失败：${error.message}`)
  }

  return data?.email ?? null
}

function generateInviteCode(length = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function signUp(params: SignUpParams): Promise<SignUpResult> {
  const { accountName, nickname, email, password } = params
  const role: UserRole = params.role ?? 'student'

  if (!validateAccountName(accountName)) {
    throw new Error('账户名格式不正确，只能包含小写字母和数字')
  }

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: {
        account_name: accountName,
        nickname,
        role,
      },
    },
  })

  if (error) {
    throw new Error(`注册失败：${error.message}`)
  }

  const userId = data.user?.id
  if (!userId) {
    throw new Error('注册失败：未获取到用户信息')
  }

  // 显式创建 user_profiles 和 user_progress 记录
  let inviteCode: string | null = null

  // 1) user_profiles：带唯一邀请码（仅学生）
  let profileError: Error | null = null
  for (let attempt = 0; attempt < 3; attempt++) {
    const candidateInviteCode = role === 'student' ? generateInviteCode() : null
    const { error: upsertError, data: profile } = await supabaseClient
      .from('user_profiles')
      .upsert(
        {
          id: userId,
          account_name: accountName,
          nickname,
          email,
          role,
          invite_code: candidateInviteCode,
        },
        { onConflict: 'id' },
      )
      .select('invite_code')
      .maybeSingle()

    if (!upsertError) {
      inviteCode = profile?.invite_code ?? null
      profileError = null
      break
    }

    profileError = new Error(upsertError.message)

    // 若是邀请码唯一索引冲突，重试生成新邀请码；其他错误直接抛出
    if (upsertError.code !== '23505' || role !== 'student') {
      break
    }
  }

  if (profileError) {
    throw new Error(`创建用户资料失败：${profileError.message}`)
  }

  // 2) 初始化 user_progress（使用默认值）
  const { error: progressError } = await supabaseClient
    .from('user_progress')
    .upsert({ user_id: userId }, { onConflict: 'user_id' })

  if (progressError) {
    throw new Error(`初始化用户进度失败：${progressError.message}`)
  }

  return { user: data.user, inviteCode }
}

export async function signIn(accountName: string, password: string) {
  const email = await getEmailByAccountName(accountName)
  if (!email) {
    throw new Error('账户名不存在')
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(`登录失败：${error.message}`)
  }

  return data
}

export async function signOut() {
  const { error } = await supabaseClient.auth.signOut()
  if (error) {
    throw new Error(`登出失败：${error.message}`)
  }
}

export async function getSession() {
  const { data, error } = await supabaseClient.auth.getSession()
  if (error) {
    throw new Error(`获取会话失败：${error.message}`)
  }
  return data
}

export async function sendRecoveryOtp(email: string) {
  const { error } = await supabaseClient.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
    },
  })

  if (error) {
    throw new Error(`发送验证码失败：${error.message}`)
  }
}

export async function verifyRecoveryOtp(payload: AccountRecoveryPayload) {
  const { email, token } = payload
  const { data, error } = await supabaseClient.auth.verifyOtp({
    email,
    token,
    type: 'email',
  })

  if (error) {
    throw new Error(`验证码验证失败：${error.message}`)
  }

  return data
}
