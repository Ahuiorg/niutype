<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { ACHIEVEMENTS, getAchievementProgress } from '@/utils/achievementChecker'

const userStore = useUserStore()

// 页面加载时检查并同步成就
onMounted(async () => {
  await userStore.checkAndSyncAchievements()
})

const unlockedIds = computed(() => {
  return userStore.userData.achievements.map(a => a.id)
})

const achievementList = computed(() => {
  return ACHIEVEMENTS.map(achievement => {
    const unlocked = userStore.userData.achievements.find(a => a.id === achievement.id)
    const progress = getAchievementProgress(achievement, userStore.userStats)
    
    return {
      ...achievement,
      unlocked: !!unlocked,
      unlockedAt: unlocked?.unlockedAt,
      progress,
    }
  })
})

const unlockedCount = computed(() => {
  return userStore.userData.achievements.length
})

const totalCount = computed(() => {
  return ACHIEVEMENTS.length
})

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}
</script>

<template>
  <div class="page-container achievements-page">
    <h1 class="page-title animate-fadeInUp">🏆 成就中心</h1>
    
    <div class="achievements-header animate-fadeInUp stagger-1">
      <div class="progress-info">
        <div class="progress-label">
          <span class="trophy-icon">🌟</span>
          <span class="progress-text">已解锁 <strong>{{ unlockedCount }}</strong> / {{ totalCount }}</span>
        </div>
        <div class="progress-bar">
          <div 
            class="progress-bar-fill"
            :style="{ width: `${(unlockedCount / totalCount) * 100}%` }"
          ></div>
        </div>
        <div class="progress-hint" v-if="unlockedCount < totalCount">
          还有 {{ totalCount - unlockedCount }} 个成就等你解锁！
        </div>
        <div class="progress-hint complete" v-else>
          🎉 太棒了！你已解锁全部成就！
        </div>
      </div>
    </div>
    
    <div class="achievements-grid">
      <div 
        v-for="(achievement, index) in achievementList" 
        :key="achievement.id"
        class="achievement-card card animate-fadeInUp"
        :class="{ 
          unlocked: achievement.unlocked, 
          locked: !achievement.unlocked 
        }"
        :style="{ animationDelay: `${0.1 + index * 0.05}s` }"
      >
        <!-- 解锁装饰 -->
        <div v-if="achievement.unlocked" class="unlock-sparkles">
          <span>✨</span>
          <span>⭐</span>
        </div>
        
        <div class="achievement-icon-wrapper">
          <div class="achievement-icon">
            {{ achievement.icon }}
          </div>
          <div v-if="achievement.unlocked" class="unlock-badge">✓</div>
        </div>
        
        <div class="achievement-content">
          <h3 class="achievement-name">{{ achievement.name }}</h3>
          <p class="achievement-desc">{{ achievement.description }}</p>
          
          <div v-if="achievement.unlocked" class="achievement-date">
            <span class="date-icon">📅</span>
            <span>{{ formatDate(achievement.unlockedAt!) }}</span>
          </div>
          
          <div v-else-if="achievement.progress" class="achievement-progress">
            <div class="mini-progress-bar">
              <div 
                class="mini-progress-fill"
                :style="{ width: `${achievement.progress.percentage}%` }"
              ></div>
            </div>
            <span class="progress-text">
              {{ achievement.progress.current }} / {{ achievement.progress.target }}
            </span>
          </div>
          
          <div v-else class="achievement-locked-hint">
            <span class="lock-icon">🔒</span>
            <span>继续努力！</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.achievements-page {
  padding-top: 32px;
}

.achievements-header {
  margin-bottom: 40px;
  text-align: center;
}

.progress-info {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 40px;
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
}

.progress-info::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(
    90deg,
    var(--candy-pink),
    var(--candy-orange),
    var(--candy-yellow),
    var(--candy-green),
    var(--candy-blue),
    var(--candy-purple)
  );
}

.progress-label {
  display: flex;
  align-items: center;
  gap: 10px;
}

.trophy-icon {
  font-size: 1.5rem;
  animation: pulse 2s ease-in-out infinite;
}

.progress-text {
  font-family: var(--font-display);
  font-size: 1.2rem;
  color: var(--color-text-primary);
}

.progress-text strong {
  font-size: 1.5rem;
  background: linear-gradient(135deg, var(--candy-orange), var(--candy-pink));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.progress-bar {
  width: 260px;
  height: 14px;
  background: linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%);
  border-radius: var(--radius-pill);
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--candy-pink),
    var(--candy-orange),
    var(--candy-yellow)
  );
  background-size: 200% 100%;
  border-radius: var(--radius-pill);
  transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation: rainbow 3s ease infinite;
  box-shadow: 0 2px 8px rgba(255, 159, 67, 0.4);
}

.progress-hint {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.progress-hint.complete {
  color: var(--candy-green);
  font-weight: 600;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.achievement-card {
  display: flex;
  gap: 18px;
  padding: 24px;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}

/* 解锁状态 */
.achievement-card.unlocked {
  background: linear-gradient(135deg, #fffbeb 0%, #fff5d6 100%);
  border: 2px solid var(--candy-yellow);
}

.achievement-card.unlocked::before {
  background: linear-gradient(90deg, var(--candy-yellow), var(--candy-orange));
}

/* 锁定状态 */
.achievement-card.locked {
  opacity: 0.7;
  background: linear-gradient(135deg, #f8f9fa 0%, #f0f2f5 100%);
}

.achievement-card.locked .achievement-icon {
  filter: grayscale(80%);
  opacity: 0.6;
}

.achievement-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-lg);
}

.achievement-card.unlocked:hover {
  box-shadow: 0 12px 32px rgba(254, 202, 87, 0.25);
}

/* 解锁装饰 */
.unlock-sparkles {
  position: absolute;
  top: 8px;
  right: 12px;
  display: flex;
  gap: 4px;
}

.unlock-sparkles span {
  font-size: 1rem;
  animation: twinkle 1.5s ease-in-out infinite;
}

.unlock-sparkles span:nth-child(2) {
  animation-delay: 0.5s;
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* 图标区域 */
.achievement-icon-wrapper {
  position: relative;
  flex-shrink: 0;
}

.achievement-icon {
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.8rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.4));
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.achievement-card.unlocked .achievement-icon {
  background: linear-gradient(135deg, rgba(254, 202, 87, 0.2), rgba(255, 159, 67, 0.1));
  animation: iconFloat 3s ease-in-out infinite;
}

@keyframes iconFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.unlock-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, var(--candy-green), var(--candy-blue));
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(92, 216, 89, 0.4);
}

/* 内容区域 */
.achievement-content {
  flex: 1;
  min-width: 0;
}

.achievement-name {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 6px;
}

.achievement-desc {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-bottom: 12px;
  line-height: 1.5;
}

.achievement-date {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: linear-gradient(135deg, var(--candy-green), var(--candy-blue));
  color: white;
  border-radius: var(--radius-pill);
  font-family: var(--font-body);
  font-size: 0.8rem;
  font-weight: 500;
}

.date-icon {
  font-size: 0.9rem;
}

.achievement-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mini-progress-bar {
  flex: 1;
  height: 8px;
  background: #e8e8e8;
  border-radius: var(--radius-pill);
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}

.mini-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--candy-orange), var(--candy-pink));
  border-radius: var(--radius-pill);
  transition: width 0.5s ease;
}

.achievement-progress .progress-text {
  font-family: var(--font-display);
  font-size: 0.85rem;
  color: var(--candy-orange);
  white-space: nowrap;
  font-weight: 600;
}

.achievement-locked-hint {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: var(--color-text-light);
}

.lock-icon {
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .achievements-grid {
    grid-template-columns: 1fr;
  }
  
  .progress-info {
    padding: 20px 28px;
  }
  
  .progress-bar {
    width: 200px;
  }
}
</style>
