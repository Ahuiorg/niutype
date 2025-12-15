<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getStage, STAGE_NAMES, EXERCISE_CONFIG } from '@/types'
import { getDayDescription } from '@/utils/exerciseGenerator'
import ProgressBar from '@/components/exercise/ProgressBar.vue'

const router = useRouter()
const userStore = useUserStore()

onMounted(() => {
  userStore.checkAndResetDay()
})

const currentStage = computed(() => getStage(userStore.userData.currentDay))
const stageName = computed(() => STAGE_NAMES[currentStage.value])
const dayDescription = computed(() => getDayDescription(userStore.userData.currentDay))

// 今日进度：按字符数计算
const todayChars = computed(() => {
  return userStore.userData.todayProgress.totalChars
})

const targetChars = computed(() => {
  return EXERCISE_CONFIG.minDailyKeystrokes  // 300 字符
})

const accuracyPercent = computed(() => {
  return Math.round(userStore.overallAccuracy * 100)
})

function startExercise() {
  router.push('/exercise')
}
</script>

<template>
  <div class="page-container home-page">
    <!-- 欢迎区域 -->
    <div class="home-header animate-fadeInUp">
      <div class="welcome-section">
        <h1 class="welcome-title">
          <span class="wave-emoji">👋</span>
          <span class="title-text">欢迎回来！</span>
        </h1>
        <p class="welcome-subtitle">
          今天是你的第 
          <span class="day-number">{{ userStore.userData.currentDay }}</span> 
          天练习
        </p>
      </div>
      
      <!-- 统计徽章 -->
      <div class="stats-badges">
        <div class="stat-badge stat-badge-fire animate-fadeInUp stagger-1">
          <div class="stat-icon-wrapper">
            <span class="stat-icon">🔥</span>
          </div>
          <span class="stat-value">{{ userStore.userData.consecutiveDays }}</span>
          <span class="stat-label">连续天数</span>
        </div>
        <div class="stat-badge stat-badge-target animate-fadeInUp stagger-2">
          <div class="stat-icon-wrapper">
            <span class="stat-icon">🎯</span>
          </div>
          <span class="stat-value">{{ accuracyPercent }}%</span>
          <span class="stat-label">准确率</span>
        </div>
        <div class="stat-badge stat-badge-chars animate-fadeInUp stagger-3">
          <div class="stat-icon-wrapper">
            <span class="stat-icon">📝</span>
          </div>
          <span class="stat-value">{{ userStore.totalChars }}</span>
          <span class="stat-label">总字符</span>
        </div>
      </div>
    </div>
    
    <!-- 今日练习卡片 -->
    <div class="today-section card animate-fadeInUp stagger-2">
      <div class="card-decoration">
        <span>🌟</span>
        <span>⭐</span>
        <span>✨</span>
      </div>
      
      <div class="today-header">
        <h2 class="section-title">📅 今日练习</h2>
        <div class="stage-badge">
          {{ stageName }}
        </div>
      </div>
      
      <p class="day-description">{{ dayDescription }}</p>
      
      <div class="today-progress">
        <ProgressBar 
          :current="todayChars"
          :total="targetChars"
          label="今日进度"
        />
      </div>
      
      <div class="today-status" v-if="userStore.todayCompleted">
        <div class="completed-badge">
          <span class="completed-icon">🎉</span>
          <span>今日练习已完成！明天再来吧~</span>
        </div>
      </div>
      
      <button 
        v-else
        class="btn btn-primary btn-large start-btn"
        @click="startExercise"
      >
        <span>{{ userStore.userData.todayProgress.totalTime > 0 ? '继续练习' : '开始练习' }}</span>
        <span class="btn-icon">▶️</span>
      </button>
    </div>
    
    <!-- 快捷入口 -->
    <div class="quick-stats grid grid-3">
      <router-link to="/stats" class="quick-card card animate-fadeInUp stagger-3">
        <div class="quick-icon-wrapper quick-icon-blue">
          <span class="quick-icon">📊</span>
        </div>
        <span class="quick-title">查看统计</span>
        <span class="quick-desc">详细练习数据</span>
        <span class="quick-arrow">→</span>
      </router-link>
      
      <router-link to="/achievements" class="quick-card card animate-fadeInUp stagger-4">
        <div class="quick-icon-wrapper quick-icon-yellow">
          <span class="quick-icon">🏆</span>
        </div>
        <span class="quick-title">成就中心</span>
        <span class="quick-desc">{{ userStore.userData.achievements.length }} 个已解锁</span>
        <span class="quick-arrow">→</span>
      </router-link>
      
      <router-link to="/gifts" class="quick-card card animate-fadeInUp stagger-5">
        <div class="quick-icon-wrapper quick-icon-pink">
          <span class="quick-icon">🎁</span>
        </div>
        <span class="quick-title">礼物商店</span>
        <span class="quick-desc">{{ userStore.availablePoints }} 积分可用</span>
        <span class="quick-arrow">→</span>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  padding-top: 40px;
}

/* 欢迎区域 */
.home-header {
  text-align: center;
  margin-bottom: 40px;
}

.welcome-section {
  margin-bottom: 32px;
}

.welcome-title {
  font-family: var(--font-display);
  font-size: 3rem;
  font-weight: 800;
  color: var(--color-text-primary);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.wave-emoji {
  display: inline-block;
  animation: wave 1.5s ease-in-out infinite;
  transform-origin: 70% 70%;
}

@keyframes wave {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(20deg); }
  75% { transform: rotate(-10deg); }
}

.title-text {
  background: linear-gradient(135deg, var(--candy-pink) 0%, var(--candy-orange) 50%, var(--candy-yellow) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-subtitle {
  font-family: var(--font-body);
  font-size: 1.35rem;
  color: var(--color-text-secondary);
}

.day-number {
  display: inline-block;
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 800;
  color: var(--candy-orange);
  padding: 0 8px;
  animation: bounce 2s ease-in-out infinite;
}

/* 统计徽章 */
.stats-badges {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.stat-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 28px;
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  min-width: 120px;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}

.stat-badge::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.stat-badge-fire::before {
  background: linear-gradient(90deg, var(--candy-orange), var(--candy-pink));
}

.stat-badge-target::before {
  background: linear-gradient(90deg, var(--candy-blue), var(--candy-purple));
}

.stat-badge-chars::before {
  background: linear-gradient(90deg, var(--candy-green), var(--candy-blue));
}

.stat-badge:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: var(--shadow-lg);
}

.stat-icon-wrapper {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(135deg, #fff5f8 0%, #f0f8ff 100%);
  margin-bottom: 8px;
}

.stat-icon {
  font-size: 1.8rem;
}

.stat-value {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--candy-orange), var(--candy-pink));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

/* 今日练习卡片 */
.today-section {
  max-width: 600px;
  margin: 0 auto 40px;
  text-align: center;
  position: relative;
  padding: 36px 32px;
}

.card-decoration {
  position: absolute;
  top: -10px;
  right: 20px;
  display: flex;
  gap: 8px;
  font-size: 1.2rem;
  opacity: 0.8;
}

.card-decoration span:nth-child(1) {
  animation: float 3s ease-in-out infinite;
}

.card-decoration span:nth-child(2) {
  animation: float 3s ease-in-out infinite 0.5s;
}

.card-decoration span:nth-child(3) {
  animation: float 3s ease-in-out infinite 1s;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.today-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 20px;
}

.section-title {
  font-family: var(--font-display);
  margin-bottom: 0;
}

.stage-badge {
  padding: 6px 16px;
  background: linear-gradient(135deg, var(--candy-purple), var(--candy-pink));
  color: white;
  border-radius: var(--radius-pill);
  font-family: var(--font-display);
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(156, 136, 255, 0.3);
}

.day-description {
  font-family: var(--font-body);
  color: var(--color-text-secondary);
  margin-bottom: 28px;
  font-size: 1.15rem;
  line-height: 1.6;
}

.today-progress {
  margin-bottom: 28px;
}

.today-status {
  margin-bottom: 16px;
}

.completed-badge {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 16px 28px;
  background: linear-gradient(135deg, var(--candy-green), var(--candy-blue));
  color: white;
  border-radius: var(--radius-pill);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.1rem;
  box-shadow: 0 4px 16px rgba(92, 216, 89, 0.3);
  animation: bounceIn 0.6s ease-out;
}

.completed-icon {
  font-size: 1.5rem;
  animation: bounce 1s ease-in-out infinite;
}

.start-btn {
  width: 100%;
  max-width: 320px;
  font-size: 1.2rem;
  padding: 18px 40px;
}

.btn-icon {
  font-size: 1.3rem;
}

/* 快捷入口卡片 */
.quick-stats {
  max-width: 900px;
  margin: 0 auto;
  gap: 24px;
}

.quick-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 32px 24px;
  text-decoration: none;
  position: relative;
  overflow: hidden;
}

.quick-card:hover {
  transform: translateY(-8px);
}

.quick-card:hover .quick-icon {
  animation: bounce 0.6s ease;
}

.quick-card:hover .quick-arrow {
  transform: translateX(5px);
  opacity: 1;
}

.quick-icon-wrapper {
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-bottom: 16px;
  transition: transform 0.3s ease;
}

.quick-icon-blue {
  background: linear-gradient(135deg, rgba(84, 160, 255, 0.15), rgba(156, 136, 255, 0.15));
}

.quick-icon-yellow {
  background: linear-gradient(135deg, rgba(254, 202, 87, 0.2), rgba(255, 159, 67, 0.15));
}

.quick-icon-pink {
  background: linear-gradient(135deg, rgba(255, 107, 157, 0.15), rgba(156, 136, 255, 0.15));
}

.quick-icon {
  font-size: 2.8rem;
}

.quick-title {
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 6px;
}

.quick-desc {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.quick-arrow {
  position: absolute;
  bottom: 16px;
  right: 20px;
  font-size: 1.2rem;
  color: var(--candy-orange);
  opacity: 0;
  transform: translateX(0);
  transition: all 0.3s ease;
}

/* 响应式 */
@media (max-width: 768px) {
  .welcome-title {
    font-size: 2rem;
    flex-direction: column;
    gap: 8px;
  }
  
  .stats-badges {
    gap: 12px;
  }
  
  .stat-badge {
    padding: 16px 20px;
    min-width: 100px;
  }
  
  .quick-stats {
    gap: 16px;
  }
}
</style>
