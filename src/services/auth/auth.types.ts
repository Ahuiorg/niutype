import type { Session, User } from '@supabase/supabase-js'

export type UserRole = 'student' | 'parent'

export interface SignUpParams {
  accountName: string
  nickname: string
  email: string
  password: string
  role?: UserRole
}

export interface SignUpResult {
  user: User | null
  inviteCode?: string | null
}

export interface AccountRecoveryPayload {
  email: string
  token: string
}

export interface AuthSessionState {
  session: Session | null
  profile?: {
    accountName: string
    email: string
    role: UserRole
    inviteCode?: string | null
  }
}
