import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomePage.vue'),
    },
    {
      path: '/exercise',
      name: 'exercise',
      component: () => import('@/views/ExercisePage.vue'),
    },
    {
      path: '/stats',
      name: 'stats',
      component: () => import('@/views/StatsPage.vue'),
    },
    {
      path: '/achievements',
      name: 'achievements',
      component: () => import('@/views/AchievementsPage.vue'),
    },
    {
      path: '/gifts',
      name: 'gifts',
      component: () => import('@/views/GiftShopPage.vue'),
    },
    {
      path: '/games',
      name: 'games',
      component: () => import('@/views/GamePage.vue'),
    },
    {
      path: '/games/snake',
      name: 'snake-game',
      component: () => import('@/views/SnakeGamePage.vue'),
    },
  ],
})

export default router

