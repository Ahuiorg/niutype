<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useExerciseStore } from '@/stores/exercise'
import { EXERCISE_CONFIG } from '@/types'
import SimpleKeyboard from '@/components/keyboard/SimpleKeyboard.vue'
import TypingDisplay from '@/components/exercise/TypingDisplay.vue'
import Timer from '@/components/exercise/Timer.vue'
import Modal from '@/components/common/Modal.vue'

const router = useRouter()
const userStore = useUserStore()
const exerciseStore = useExerciseStore()

const pressedKey = ref('')
const pressResult = ref<'correct' | 'wrong' | null>(null)
const showCompleteModal = ref(false)
const completionResult = ref<any>(null)
const timerInterval = ref<number | null>(null)
const isPracticeMode = ref(false)
const practiceChars = ref(0)

// 已输入的字符
const inputChars = ref<{ char: string, correct: boolean }[]>([])

// 今日统计
const todayAccuracy = computed(() => {
  const { totalChars, correctChars } = userStore.userData.todayProgress
  if (totalChars === 0) return 0
  return Math.round((correctChars / totalChars) * 100)
})

onMounted(() => {
  exerciseStore.initExercise()
  window.addEventListener('keydown', handleKeyDown)
  startTimer()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  stopTimer()
})

// 监听完成状态
watch(() => exerciseStore.isCompleted, (completed) => {
  if (completed && exerciseStore.isRunning) {
    completeExercise()
  }
})

function startTimer() {
  if (timerInterval.value) return
  timerInterval.value = window.setInterval(() => {
    // 触发响应式更新
  }, 1000)
}

function stopTimer() {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
}

function handleKeyDown(event: KeyboardEvent) {
  // 忽略特殊键
  if (event.metaKey || event.ctrlKey || event.altKey) return
  
  // 空格键控制暂停/继续
  if (event.code === 'Space') {
    event.preventDefault()
    if (!exerciseStore.isRunning) {
      exerciseStore.start()
    } else if (exerciseStore.isPaused) {
      exerciseStore.resume()
    } else {
      exerciseStore.pause()
    }
    return
  }
  
  // 获取输入的字符
  let key = event.key
  
  // 字母转大写
  if (/^[a-z]$/i.test(key)) {
    key = key.toUpperCase()
  }
  
  // 只接受有效输入
  const validChars = /^[A-Z0-9`\-=\[\]\\;',./]$/
  if (!validChars.test(key)) return
  
  event.preventDefault()
  
  // 根据模式选择处理方法
  const result = isPracticeMode.value 
    ? exerciseStore.handlePracticeInput(key)
    : exerciseStore.handleInput(key)
  
  if (result !== 'ignore') {
    pressedKey.value = key
    pressResult.value = result
    
    // 记录输入
    const targetChar = exerciseStore.exercises[exerciseStore.currentIndex - (result === 'correct' ? 1 : 0)]
    inputChars.value.push({
      char: key,
      correct: result === 'correct'
    })
    
    // 重新练习模式下统计字符数
    if (isPracticeMode.value && result === 'correct') {
      practiceChars.value++
    }
    
    // 清除动画效果
    setTimeout(() => {
      pressedKey.value = ''
      pressResult.value = null
    }, 150)
  }
}

function completeExercise() {
  stopTimer()
  completionResult.value = exerciseStore.completeExercise()
  showCompleteModal.value = true
}

function goHome() {
  exerciseStore.reset()
  router.push('/')
}

function dismissRest() {
  exerciseStore.dismissRestReminder()
  exerciseStore.resume()
}

// 开始重新练习
function startPractice() {
  showCompleteModal.value = false
  isPracticeMode.value = true
  practiceChars.value = 0
  inputChars.value = []
  exerciseStore.restartExercise()
}

// 停止重新练习
function stopPractice() {
  exerciseStore.reset()
  isPracticeMode.value = false
  inputChars.value = []
}
</script>

<template>
  <div class="exercise-page">
    <!-- 已完成状态 - 可选择重新练习 -->
    <div v-if="userStore.todayCompleted && !showCompleteModal && !isPracticeMode" class="completed-state">
      <div class="card text-center completed-card">
        <div class="completed-celebration">
          <span class="celebration-icon">🎉</span>
          <div class="confetti">
            <span>🌟</span>
            <span>⭐</span>
            <span>✨</span>
            <span>💫</span>
          </div>
        </div>
        <h2 class="completed-title">今日练习已完成！</h2>
        <p class="completed-text">想继续练习吗？重新练习的输入会计入总统计哦~</p>
        <div class="completed-actions">
          <button class="btn btn-primary" @click="startPractice">
            🔄 重新练习
          </button>
          <button class="btn btn-secondary" @click="goHome">
            返回首页
          </button>
        </div>
      </div>
    </div>
    
    <!-- 练习界面 -->
    <div v-else class="exercise-content">
      <!-- 顶部状态栏 -->
      <div :class="['exercise-header', { 'practice-header': isPracticeMode }]">
        <div class="header-left">
          <button class="btn btn-secondary header-btn" @click="isPracticeMode ? stopPractice() : goHome()">
            ← {{ isPracticeMode ? '结束练习' : '返回' }}
          </button>
        </div>
        
        <div class="header-center">
          <div class="day-info">
            <span :class="['day-label', { 'practice-label': isPracticeMode }]">
              {{ isPracticeMode ? '🔄 自由练习模式' : `第 ${userStore.userData.currentDay} 天` }}
            </span>
            <span class="day-desc">{{ exerciseStore.dayDescription }}</span>
          </div>
        </div>
        
        <div class="header-right">
          <div v-if="isPracticeMode" class="practice-stats">
            <span class="practice-icon">⌨️</span>
            <span class="practice-count">{{ practiceChars }}</span>
          </div>
          <div v-else class="stats-row">
            <div class="accuracy-display">
              <span class="accuracy-icon">🎯</span>
              <span class="accuracy-value">{{ todayAccuracy }}%</span>
            </div>
            <Timer 
              :remaining-ms="exerciseStore.remainingTime"
              :total-ms="EXERCISE_CONFIG.dailyDuration"
              :is-paused="exerciseStore.isPaused"
              compact
            />
          </div>
        </div>
      </div>
      
      <!-- 主练习区域 -->
      <div class="exercise-main">
        <!-- 未开始提示 -->
        <div v-if="!exerciseStore.isRunning" class="start-prompt">
          <div class="typing-wrapper">
            <TypingDisplay
              :target-chars="exerciseStore.exercises"
              :input-chars="inputChars"
              :current-index="exerciseStore.currentIndex"
            />
          </div>
          <div class="prompt-box">
            <span class="prompt-icon">👆</span>
            <p class="start-hint">按 <kbd>空格键</kbd> 开始练习</p>
          </div>
        </div>
        
        <!-- 暂停提示 -->
        <div v-else-if="exerciseStore.isPaused" class="pause-prompt">
          <div class="typing-wrapper">
            <TypingDisplay
              :target-chars="exerciseStore.exercises"
              :input-chars="inputChars"
              :current-index="exerciseStore.currentIndex"
            />
          </div>
          <div class="prompt-box prompt-paused">
            <span class="prompt-icon">⏸️</span>
            <p class="pause-hint">已暂停 - 按 <kbd>空格键</kbd> 继续</p>
          </div>
        </div>
        
        <!-- 练习中 -->
        <div v-else class="typing-area">
          <div class="typing-wrapper">
            <TypingDisplay
              :target-chars="exerciseStore.exercises"
              :input-chars="inputChars"
              :current-index="exerciseStore.currentIndex"
            />
          </div>
        </div>
      </div>
      
      <!-- 键盘区域 -->
      <div class="keyboard-section">
        <SimpleKeyboard 
          :target-key="exerciseStore.currentChar"
          :pressed-key="pressedKey"
          :press-result="pressResult"
        />
      </div>
    </div>
    
    <!-- 休息提醒弹窗 -->
    <Modal 
      :show="exerciseStore.showRestReminder" 
      title="休息一下 👀"
      @close="dismissRest"
    >
      <div class="rest-content">
        <div class="rest-icon">😊</div>
        <p>你已经连续练习 5 分钟了！</p>
        <p>建议休息一下眼睛，看看远处 30 秒~</p>
        <div class="rest-tips">
          <span>💡 小提示：眨眨眼睛，转转脖子</span>
        </div>
      </div>
      <template #footer>
        <button class="btn btn-primary" @click="dismissRest">
          我休息好了，继续练习 ✨
        </button>
      </template>
    </Modal>
    
    <!-- 完成弹窗 -->
    <Modal 
      :show="showCompleteModal" 
      title="🎉 今日练习完成！"
    >
      <div class="complete-content" v-if="completionResult">
        <div class="complete-stats">
          <div class="complete-stat">
            <div class="stat-icon-bg stat-icon-chars">
              <span class="stat-icon">📝</span>
            </div>
            <span class="stat-value">{{ userStore.userData.todayProgress.totalChars }}</span>
            <span class="stat-label">总字符</span>
          </div>
          <div class="complete-stat">
            <div class="stat-icon-bg stat-icon-accuracy">
              <span class="stat-icon">🎯</span>
            </div>
            <span class="stat-value">{{ todayAccuracy }}%</span>
            <span class="stat-label">准确率</span>
          </div>
        </div>
        
        <div class="points-earned">
          <h3>🌟 获得积分</h3>
          <div class="points-breakdown">
            <div class="points-item">
              <span>基础积分</span>
              <span class="points-value">+{{ completionResult.points.base }}</span>
            </div>
            <div class="points-item" v-if="completionResult.points.accuracyBonus > 0">
              <span>准确率加成</span>
              <span class="points-value text-success">+{{ completionResult.points.accuracyBonus }}</span>
            </div>
            <div class="points-item" v-if="completionResult.points.speedBonus > 0">
              <span>速度加成</span>
              <span class="points-value text-success">+{{ completionResult.points.speedBonus }}</span>
            </div>
            <div class="points-item" v-if="completionResult.points.streakBonus > 0">
              <span>连续打卡加成</span>
              <span class="points-value text-success">+{{ completionResult.points.streakBonus }}</span>
            </div>
            <div class="points-total">
              <span>总计</span>
              <span class="total-value">+{{ completionResult.points.total }}</span>
            </div>
          </div>
        </div>
        
        <div class="new-achievements" v-if="completionResult.newAchievements.length > 0">
          <h3>🏆 解锁新成就</h3>
          <div class="achievement-list">
            <div 
              v-for="achievement in completionResult.newAchievements" 
              :key="achievement.id"
              class="achievement-item animate-bounceIn"
            >
              <span class="achievement-icon">{{ achievement.icon }}</span>
              <div class="achievement-info">
                <span class="achievement-name">{{ achievement.name }}</span>
                <span class="achievement-desc">{{ achievement.description }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="complete-actions">
          <button class="btn btn-secondary" @click="startPractice">
            🔄 继续练习
          </button>
          <button class="btn btn-primary" @click="goHome">
            返回首页 🏠
          </button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.exercise-page {
  min-height: calc(100vh - 70px);
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
}

/* 完成状态 */
.completed-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.completed-card {
  padding: 48px 40px;
  max-width: 420px;
  position: relative;
  overflow: visible;
}

.completed-celebration {
  position: relative;
  margin-bottom: 20px;
}

.celebration-icon {
  font-size: 5rem;
  display: block;
  animation: bounce 1s ease-in-out infinite;
}

.confetti {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 150px;
  height: 80px;
  pointer-events: none;
}

.confetti span {
  position: absolute;
  font-size: 1.5rem;
  animation: confetti-fall 2s ease-in-out infinite;
}

.confetti span:nth-child(1) { left: 10%; animation-delay: 0s; }
.confetti span:nth-child(2) { left: 30%; animation-delay: 0.3s; }
.confetti span:nth-child(3) { left: 60%; animation-delay: 0.6s; }
.confetti span:nth-child(4) { left: 85%; animation-delay: 0.9s; }

@keyframes confetti-fall {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(60px) rotate(360deg);
    opacity: 0;
  }
}

.completed-title {
  font-family: var(--font-display);
  font-size: 1.75rem;
  color: var(--color-text-primary);
  margin-bottom: 12px;
}

.completed-text {
  font-family: var(--font-body);
  color: var(--color-text-secondary);
  margin-bottom: 24px;
  line-height: 1.6;
}

.completed-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* 练习界面 */
.exercise-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 顶部状态栏 */
.exercise-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: white;
  box-shadow: var(--shadow-sm);
  position: relative;
  z-index: 10;
}

.practice-header {
  background: linear-gradient(135deg, rgba(92, 216, 89, 0.1) 0%, rgba(84, 160, 255, 0.1) 100%);
  border-bottom: 3px solid var(--candy-green);
}

.header-btn {
  padding: 10px 20px;
  font-size: 0.95rem;
}

.day-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.day-label {
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--candy-orange), var(--candy-pink));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.practice-label {
  background: linear-gradient(135deg, var(--candy-green), var(--candy-blue)) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
}

.day-desc {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.stats-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.accuracy-display {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: linear-gradient(135deg, rgba(255, 159, 67, 0.1), rgba(255, 107, 157, 0.1));
  border-radius: var(--radius-pill);
}

.accuracy-icon {
  font-size: 1.3rem;
}

.accuracy-value {
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--candy-orange);
}

.practice-stats {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  background: white;
  border-radius: var(--radius-pill);
  box-shadow: var(--shadow-sm);
}

.practice-icon {
  font-size: 1.2rem;
}

.practice-count {
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--candy-green);
}

/* 主练习区域 */
.exercise-main {
  min-height: 350px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
}

.typing-wrapper {
  margin-bottom: 28px;
}

.start-prompt,
.pause-prompt,
.typing-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.prompt-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 28px;
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  animation: pulse 2s ease-in-out infinite;
}

.prompt-paused {
  background: linear-gradient(135deg, rgba(254, 202, 87, 0.2), rgba(255, 159, 67, 0.1));
}

.prompt-icon {
  font-size: 1.5rem;
}

.start-hint,
.pause-hint {
  font-family: var(--font-body);
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  margin: 0;
}

kbd {
  display: inline-block;
  padding: 6px 14px;
  background: linear-gradient(135deg, var(--candy-orange), var(--candy-pink));
  color: white;
  border-radius: var(--radius-md);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.95rem;
  box-shadow: 0 2px 0 var(--candy-orange-dark);
}

/* 键盘区域 */
.keyboard-section {
  flex: 1;
  padding: 24px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: linear-gradient(180deg, #e8ecf0 0%, #dde3e8 100%);
}

/* 弹窗内容样式 */
.rest-content {
  text-align: center;
}

.rest-icon {
  font-size: 4rem;
  margin-bottom: 16px;
  animation: wiggle 1s ease-in-out infinite;
}

@keyframes wiggle {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}

.rest-content p {
  font-family: var(--font-body);
  margin-bottom: 12px;
  font-size: 1.1rem;
  color: var(--color-text-primary);
}

.rest-tips {
  padding: 14px 20px;
  background: linear-gradient(135deg, rgba(254, 202, 87, 0.2), rgba(255, 159, 67, 0.1));
  border-radius: var(--radius-lg);
  color: var(--color-text-secondary);
  font-family: var(--font-body);
}

/* 完成弹窗 */
.complete-content {
  min-width: 320px;
}

.complete-stats {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 28px;
}

.complete-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-icon-bg {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-bottom: 8px;
}

.stat-icon-chars {
  background: linear-gradient(135deg, rgba(84, 160, 255, 0.2), rgba(156, 136, 255, 0.2));
}

.stat-icon-accuracy {
  background: linear-gradient(135deg, rgba(255, 159, 67, 0.2), rgba(255, 107, 157, 0.2));
}

.complete-stat .stat-icon {
  font-size: 2rem;
}

.complete-stat .stat-value {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--candy-orange), var(--candy-pink));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.complete-stat .stat-label {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.points-earned h3,
.new-achievements h3 {
  font-family: var(--font-display);
  font-size: 1.1rem;
  margin-bottom: 14px;
  color: var(--color-text-primary);
}

.points-breakdown {
  background: linear-gradient(135deg, #fff9f5 0%, #f5f9ff 100%);
  border-radius: var(--radius-lg);
  padding: 16px;
}

.points-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  font-family: var(--font-body);
}

.points-item:last-child {
  border-bottom: none;
}

.points-value {
  font-family: var(--font-display);
  font-weight: 600;
}

.points-total {
  display: flex;
  justify-content: space-between;
  padding-top: 14px;
  margin-top: 10px;
  border-top: 2px solid var(--candy-orange);
  font-family: var(--font-display);
  font-weight: 700;
}

.total-value {
  font-size: 1.4rem;
  background: linear-gradient(135deg, var(--candy-orange), var(--candy-pink));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.new-achievements {
  margin-top: 24px;
}

.achievement-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: linear-gradient(135deg, rgba(254, 202, 87, 0.2) 0%, rgba(255, 159, 67, 0.15) 100%);
  border-radius: var(--radius-lg);
  border: 2px solid rgba(254, 202, 87, 0.3);
}

.achievement-item .achievement-icon {
  font-size: 2.2rem;
}

.achievement-info {
  display: flex;
  flex-direction: column;
}

.achievement-name {
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--color-text-primary);
}

.achievement-desc {
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.complete-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 8px;
}

@media (max-width: 768px) {
  .exercise-header {
    flex-wrap: wrap;
    gap: 12px;
  }
  
  .header-center {
    order: -1;
    width: 100%;
    text-align: center;
  }
  
  .exercise-main {
    padding: 20px 16px;
    min-height: 280px;
  }
  
  .completed-actions,
  .complete-actions {
    flex-direction: column;
  }
}
</style>
