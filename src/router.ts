import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomePage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/exercise',
      name: 'exercise',
      component: () => import('@/views/ExercisePage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/stats',
      name: 'stats',
      component: () => import('@/views/StatsPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/achievements',
      name: 'achievements',
      component: () => import('@/views/AchievementsPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/gifts',
      name: 'gifts',
      component: () => import('@/views/GiftShopPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/games',
      name: 'games',
      component: () => import('@/views/GamePage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/games/snake',
      name: 'snake-game',
      component: () => import('@/views/SnakeGamePage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginPage.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterPage.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/recover',
      name: 'account-recover',
      component: () => import('@/views/AccountRecoveryPage.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/student/parents',
      name: 'student-parents',
      component: () => import('@/views/StudentParentsPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/parent/manage',
      name: 'parent-manage',
      component: () => import('@/views/ParentManagePage.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  if (!authStore.initialized) {
    await authStore.initSession()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (authStore.isAuthenticated && to.meta.guestOnly) {
    return { path: (to.query.redirect as string) || '/' }
  }

  return true
})

export default router

