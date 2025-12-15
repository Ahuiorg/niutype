import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'
import {
  getUserRole,
  getStudentList,
  addStudentRelationByInviteCode,
  addStudentRelationByAccountName,
  removeStudentRelation,
  getStudentProgress,
  getStudentExerciseRecords,
  getStudentGameRecords,
  updatePracticePlayRatio,
  type StudentInfo,
  type ParentStudentRelation,
} from '@/services/api/parent.api'
import type { UserProgress } from '@/services/api/user.api'
import type { ExerciseRecord } from '@/services/api/exercise.api'
import type { GameRecord } from '@/services/api/game.api'

export const useParentStore = defineStore('parent', () => {
  const authStore = useAuthStore()
  const currentUserId = computed(() => authStore.session?.user?.id ?? null)

  // 状态
  const students = ref<Array<{ relation: ParentStudentRelation; student: StudentInfo | null }>>([])
  const loading = ref(false)
  const error = ref('')

  // 当前选中学生的详情
  const selectedStudentId = ref<string | null>(null)
  const selectedStudentProgress = ref<UserProgress | null>(null)
  const selectedStudentExercises = ref<ExerciseRecord[]>([])
  const selectedStudentGames = ref<GameRecord[]>([])

  async function loadStudents() {
    const userId = currentUserId.value
    if (!userId) return
    loading.value = true
    error.value = ''
    try {
      students.value = await getStudentList(userId)
    } catch (e) {
      error.value = e instanceof Error ? e.message : '加载学生列表失败'
    } finally {
      loading.value = false
    }
  }

  async function bindStudentByInviteCode(inviteCode: string) {
    const userId = currentUserId.value
    if (!userId) throw new Error('未登录')
    loading.value = true
    error.value = ''
    try {
      await addStudentRelationByInviteCode(userId, inviteCode)
      await loadStudents()
    } catch (e) {
      error.value = e instanceof Error ? e.message : '绑定失败'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function bindStudentByAccountName(accountName: string) {
    const userId = currentUserId.value
    if (!userId) throw new Error('未登录')
    loading.value = true
    error.value = ''
    try {
      await addStudentRelationByAccountName(userId, accountName)
      await loadStudents()
    } catch (e) {
      error.value = e instanceof Error ? e.message : '绑定失败'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function unbindStudent(studentId: string) {
    const userId = currentUserId.value
    if (!userId) throw new Error('未登录')
    loading.value = true
    error.value = ''
    try {
      await removeStudentRelation(userId, studentId)
      await loadStudents()
      if (selectedStudentId.value === studentId) {
        selectedStudentId.value = null
        selectedStudentProgress.value = null
        selectedStudentExercises.value = []
        selectedStudentGames.value = []
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '解绑失败'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function selectStudent(studentId: string) {
    const userId = currentUserId.value
    if (!userId) return
    selectedStudentId.value = studentId
    loading.value = true
    error.value = ''
    try {
      const [progress, exercises, games] = await Promise.all([
        getStudentProgress(userId, studentId),
        getStudentExerciseRecords(userId, studentId),
        getStudentGameRecords(userId, studentId),
      ])
      selectedStudentProgress.value = progress
      selectedStudentExercises.value = exercises
      selectedStudentGames.value = games
    } catch (e) {
      error.value = e instanceof Error ? e.message : '加载学生数据失败'
    } finally {
      loading.value = false
    }
  }

  async function updateRatio(studentId: string, practiceMinutes: number, playMinutes: number, maxDailyMinutes?: number | null) {
    const userId = currentUserId.value
    if (!userId) throw new Error('未登录')
    loading.value = true
    error.value = ''
    try {
      await updatePracticePlayRatio(userId, studentId, practiceMinutes, playMinutes, maxDailyMinutes)
      await loadStudents()
    } catch (e) {
      error.value = e instanceof Error ? e.message : '更新比例失败'
      throw e
    } finally {
      loading.value = false
    }
  }

  function clearSelection() {
    selectedStudentId.value = null
    selectedStudentProgress.value = null
    selectedStudentExercises.value = []
    selectedStudentGames.value = []
  }

  return {
    students,
    loading,
    error,
    selectedStudentId,
    selectedStudentProgress,
    selectedStudentExercises,
    selectedStudentGames,
    loadStudents,
    bindStudentByInviteCode,
    bindStudentByAccountName,
    unbindStudent,
    selectStudent,
    updateRatio,
    clearSelection,
  }
})
