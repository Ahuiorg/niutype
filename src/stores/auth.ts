import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Session } from '@supabase/supabase-js'
import type { AccountRecoveryPayload, SignUpParams } from '@/services/auth/auth.types'
import {
  checkAccountNameExists,
  getSession as fetchSession,
  sendRecoveryOtp,
  signIn,
  signOut,
  signUp,
  validateAccountName,
  verifyRecoveryOtp,
} from '@/services/auth/auth.service'
import { getUserProfile, type UserProfile } from '@/services/api/user.api'

export const useAuthStore = defineStore('auth', () => {
  const session = ref<Session | null>(null)
  const userProfile = ref<UserProfile | null>(null)
  const initialized = ref(false)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!session.value)
  const isParent = computed(() => userProfile.value?.role === 'parent')
  const isStudent = computed(() => userProfile.value?.role === 'student')

  // 加载用户数据（从云端同步）
  async function loadUserData() {
    const userId = session.value?.user?.id
    if (!userId) return

    // 加载用户 profile（包含角色信息）
    try {
      userProfile.value = await getUserProfile(userId)
    } catch (error) {
      console.warn('Failed to load user profile:', error)
    }

    // 动态导入避免循环依赖
    const { useUserStore } = await import('./user')
    const { useExerciseStore } = await import('./exercise')
    const userStore = useUserStore()
    const exerciseStore = useExerciseStore()

    // 先重置本地数据，再从云端加载
    userStore.resetData()

    try {
      // 从云端加载用户数据
      await userStore.loadFromCloud()
      await exerciseStore.pullFromCloud()
    } catch (error) {
      console.warn('Failed to load user data from cloud:', error)
    }
  }

  // 清除用户数据（登出时）
  async function clearUserData() {
    // 清除 profile
    userProfile.value = null

    const { useUserStore } = await import('./user')
    const { useExerciseStore } = await import('./exercise')
    const { useGameStore } = await import('./game')
    const userStore = useUserStore()
    const exerciseStore = useExerciseStore()
    const gameStore = useGameStore()

    // 只重置本地状态，不保存到云端（避免覆盖云端数据）
    userStore.resetData()
    exerciseStore.resetLocal()
    gameStore.reset()
  }

  async function initSession() {
    const { session: current } = await fetchSession()
    session.value = current ?? null
    initialized.value = true

    // 如果已登录，加载用户数据
    if (session.value) {
      await loadUserData()
    }
  }

  function setSession(next: Session | null) {
    session.value = next
  }

  async function login(accountName: string, password: string) {
    loading.value = true
    try {
      const { session: nextSession } = await signIn(accountName, password)
      session.value = nextSession ?? null

      // 登录成功后加载用户数据
      if (nextSession) {
        await loadUserData()
      }

      return nextSession
    } finally {
      loading.value = false
    }
  }

  async function register(payload: SignUpParams) {
    loading.value = true
    try {
      const result = await signUp(payload)
      const { session: currentSession } = await fetchSession()
      session.value = currentSession ?? null

      // 注册成功后加载用户数据
      if (currentSession) {
        await loadUserData()
      }

      return result
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    try {
      // 登出前清除本地用户数据
      await clearUserData()

      await signOut()
      session.value = null
    } finally {
      loading.value = false
    }
  }

  async function sendOtp(email: string) {
    loading.value = true
    try {
      await sendRecoveryOtp(email)
    } finally {
      loading.value = false
    }
  }

  async function verifyOtp(payload: AccountRecoveryPayload) {
    loading.value = true
    try {
      const { session: next } = await verifyRecoveryOtp(payload)
      session.value = next ?? null

      // 验证码登录成功后加载用户数据
      if (next) {
        await loadUserData()
      }

      return next
    } finally {
      loading.value = false
    }
  }

  return {
    session,
    userProfile,
    loading,
    initialized,
    isAuthenticated,
    isParent,
    isStudent,
    validateAccountName,
    checkAccountNameExists,
    initSession,
    setSession,
    login,
    register,
    logout,
    sendOtp,
    verifyOtp,
  }
})
