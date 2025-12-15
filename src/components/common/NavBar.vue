<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useGameStore } from '@/stores/game'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const gameStore = useGameStore()

const navItems = [
  { path: '/', name: '首页', icon: '🏠' },
  { path: '/exercise', name: '练习', icon: '⌨️' },
  { path: '/stats', name: '统计', icon: '📊' },
  { path: '/achievements', name: '成就', icon: '🏆' },
  { path: '/gifts', name: '礼物', icon: '🎁' },
  { path: '/games', name: '游戏', icon: '🎮' },
]

const isActive = (path: string) => {
  if (path === '/games') {
    return route.path.startsWith('/games')
  }
  return route.path === path
}

const remainingGameTime = computed(() => gameStore.remainingTime)

const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

onMounted(() => {
  gameStore.checkAndResetDay()
})
</script>

<template>
  <nav class="navbar">
    <div class="navbar-content">
      <div class="navbar-brand" @click="router.push('/')">
        <span class="brand-icon">⌨️</span>
        <span class="brand-text">打字小达人</span>
        <span class="brand-sparkle">✨</span>
      </div>
      
      <div class="navbar-menu">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: isActive(item.path) }"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-text">{{ item.name }}</span>
        </router-link>
      </div>
      
      <div class="navbar-right">
        <div class="navbar-game-time" v-if="remainingGameTime > 0">
          <span class="game-time-icon">⏱️</span>
          <span class="game-time-value">{{ formatTime(remainingGameTime) }}</span>
        </div>
        <div class="navbar-points">
          <span class="points-icon">⭐</span>
          <span class="points-value">{{ userStore.availablePoints }}</span>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  background: linear-gradient(135deg, var(--candy-pink) 0%, var(--candy-orange) 50%, var(--candy-yellow) 100%);
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 
    0 4px 20px rgba(255, 107, 157, 0.3),
    inset 0 -2px 0 rgba(0, 0, 0, 0.05);
}

.navbar-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
}

.navbar-brand:hover {
  transform: scale(1.08);
}

.navbar-brand:hover .brand-sparkle {
  opacity: 1;
  transform: rotate(20deg) scale(1.2);
}

.brand-icon {
  font-size: 1.75rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.brand-text {
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 800;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  letter-spacing: 0.5px;
}

.brand-sparkle {
  font-size: 1.2rem;
  opacity: 0.7;
  transition: all 0.3s ease;
  animation: twinkle 2s ease-in-out infinite;
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.7;
    transform: rotate(0deg) scale(1);
  }
  50% {
    opacity: 1;
    transform: rotate(15deg) scale(1.1);
  }
}

.navbar-menu {
  display: flex;
  gap: 6px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: var(--radius-pill);
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-family: var(--font-display);
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}

.nav-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-pill);
  transform: scale(0);
  transition: transform 0.3s ease;
}

.nav-item:hover::before {
  transform: scale(1);
}

.nav-item:hover {
  color: white;
  transform: translateY(-2px);
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.3);
  color: white;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.1),
    inset 0 2px 0 rgba(255, 255, 255, 0.2);
}

.nav-item.active::before {
  display: none;
}

.nav-icon {
  font-size: 1.2rem;
  position: relative;
  z-index: 1;
}

.nav-text {
  font-size: 0.95rem;
  position: relative;
  z-index: 1;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.navbar-game-time {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-pill);
  color: white;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.95rem;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
}

.game-time-icon {
  font-size: 1.1rem;
}

.game-time-value {
  font-family: var(--font-keyboard);
  font-weight: 600;
}

.navbar-points {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: var(--radius-pill);
  color: white;
  font-family: var(--font-display);
  font-weight: 700;
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.05),
    0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.navbar-points:hover {
  background: rgba(255, 255, 255, 0.35);
  transform: scale(1.05);
}

.points-icon {
  font-size: 1.3rem;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
}

.points-value {
  font-size: 1.15rem;
}

@media (max-width: 768px) {
  .navbar-content {
    flex-wrap: wrap;
    height: auto;
    padding: 12px 0;
  }
  
  .navbar-menu {
    order: 3;
    width: 100%;
    justify-content: center;
    margin-top: 12px;
    flex-wrap: wrap;
  }
  
  .nav-text {
    display: none;
  }
  
  .nav-item {
    padding: 10px 14px;
  }
  
  .brand-sparkle {
    display: none;
  }
}
</style>
