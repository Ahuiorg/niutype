<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { FINGER_COLORS, FINGER_NAMES, type Finger } from '@/types'
import { KEYBOARD_ROWS, LETTER_TO_FINGER, FINGER_TO_LETTERS } from '@/utils/fingerMapping'

const userStore = useUserStore()

const overallAccuracy = computed(() => Math.round(userStore.overallAccuracy * 100))
const avgResponseTime = computed(() => Math.round(userStore.avgResponseTime))

// 计算每个字母的准确率
function getLetterAccuracy(letter: string): number {
  const stat = userStore.userData.letterStats[letter]
  if (!stat || stat.totalAttempts === 0) return -1 // -1 表示未练习
  return stat.correctAttempts / stat.totalAttempts
}

// 获取字母的颜色（基于准确率）
function getLetterColor(letter: string): string {
  const accuracy = getLetterAccuracy(letter)
  if (accuracy === -1) return '#e8e8e8' // 未练习
  if (accuracy >= 0.95) return '#5CD859' // 优秀 - candy green
  if (accuracy >= 0.85) return '#54A0FF' // 良好 - candy blue
  if (accuracy >= 0.7) return '#FECA57'  // 一般 - candy yellow
  return '#FF6B9D' // 需要加强 - candy pink
}

// 计算每个手指的准确率
const fingerStats = computed(() => {
  const stats: { finger: Finger; accuracy: number; attempts: number }[] = []
  
  for (const [finger, letters] of Object.entries(FINGER_TO_LETTERS)) {
    let totalAttempts = 0
    let correctAttempts = 0
    
    for (const letter of letters) {
      const stat = userStore.userData.letterStats[letter]
      if (stat) {
        totalAttempts += stat.totalAttempts
        correctAttempts += stat.correctAttempts
      }
    }
    
    stats.push({
      finger: finger as Finger,
      accuracy: totalAttempts > 0 ? correctAttempts / totalAttempts : 0,
      attempts: totalAttempts,
    })
  }
  
  return stats
})

// 找出最弱的手指
const weakestFinger = computed(() => {
  const practiced = fingerStats.value.filter(s => s.attempts > 0)
  if (practiced.length === 0) return null
  return practiced.reduce((min, s) => s.accuracy < min.accuracy ? s : min)
})

// 最近7天的记录
const recentRecords = computed(() => {
  return userStore.userData.dailyRecords.slice(-7).reverse()
})
</script>

<template>
  <div class="page-container stats-page">
    <h1 class="page-title animate-fadeInUp">📊 练习统计</h1>
    
    <!-- 总体统计 -->
    <div class="stats-overview grid grid-4 animate-fadeInUp stagger-1">
      <div class="stat-card card">
        <div class="stat-icon-wrapper stat-icon-blue">
          <span class="stat-icon">📝</span>
        </div>
        <span class="stat-value">{{ userStore.totalChars }}</span>
        <span class="stat-label">总字符数</span>
      </div>
      <div class="stat-card card">
        <div class="stat-icon-wrapper stat-icon-orange">
          <span class="stat-icon">🎯</span>
        </div>
        <span class="stat-value">{{ overallAccuracy }}%</span>
        <span class="stat-label">总准确率</span>
      </div>
      <div class="stat-card card">
        <div class="stat-icon-wrapper stat-icon-purple">
          <span class="stat-icon">⚡</span>
        </div>
        <span class="stat-value">{{ avgResponseTime }}ms</span>
        <span class="stat-label">平均反应</span>
      </div>
      <div class="stat-card card">
        <div class="stat-icon-wrapper stat-icon-green">
          <span class="stat-icon">📅</span>
        </div>
        <span class="stat-value">{{ userStore.userData.dailyRecords.length }}</span>
        <span class="stat-label">练习天数</span>
      </div>
    </div>
    
    <!-- 键盘热力图 -->
    <div class="section card animate-fadeInUp stagger-2">
      <h2 class="section-title">🔥 字母准确率热力图</h2>
      <p class="section-desc">颜色越绿表示准确率越高，粉色表示需要加强练习</p>
      
      <div class="keyboard-heatmap">
        <div 
          v-for="(row, rowIndex) in KEYBOARD_ROWS" 
          :key="rowIndex"
          class="heatmap-row"
          :class="`row-${rowIndex}`"
        >
          <div 
            v-for="letter in row" 
            :key="letter"
            class="heatmap-key"
            :style="{ backgroundColor: getLetterColor(letter) }"
            :title="`${letter}: ${getLetterAccuracy(letter) === -1 ? '未练习' : Math.round(getLetterAccuracy(letter) * 100) + '%'}`"
          >
            <span class="key-letter">{{ letter }}</span>
            <span class="key-accuracy" v-if="getLetterAccuracy(letter) !== -1">
              {{ Math.round(getLetterAccuracy(letter) * 100) }}%
            </span>
          </div>
        </div>
      </div>
      
      <div class="heatmap-legend">
        <div class="legend-item">
          <div class="legend-color" style="background: #e8e8e8"></div>
          <span>未练习</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background: #FF6B9D"></div>
          <span>&lt;70%</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background: #FECA57"></div>
          <span>70-85%</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background: #54A0FF"></div>
          <span>85-95%</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background: #5CD859"></div>
          <span>≥95%</span>
        </div>
      </div>
    </div>
    
    <!-- 手指统计 -->
    <div class="section card animate-fadeInUp stagger-3">
      <h2 class="section-title">👋 手指准确率</h2>
      
      <div class="finger-stats">
        <div 
          v-for="stat in fingerStats" 
          :key="stat.finger"
          class="finger-stat-item"
        >
          <div 
            class="finger-bar"
            :style="{ 
              '--finger-color': FINGER_COLORS[stat.finger],
              '--bar-width': `${stat.attempts > 0 ? stat.accuracy * 100 : 0}%`
            }"
          >
            <div class="finger-bar-fill"></div>
          </div>
          <div class="finger-info">
            <span class="finger-name">{{ FINGER_NAMES[stat.finger] }}</span>
            <span class="finger-accuracy">
              {{ stat.attempts > 0 ? Math.round(stat.accuracy * 100) + '%' : '未练习' }}
            </span>
          </div>
        </div>
      </div>
      
      <div class="weak-finger-tip" v-if="weakestFinger && weakestFinger.accuracy < 0.8">
        <span class="tip-icon">💡</span>
        <span>建议多练习 <strong>{{ FINGER_NAMES[weakestFinger.finger] }}</strong>，当前准确率较低</span>
      </div>
    </div>
    
    <!-- 最近记录 -->
    <div class="section card animate-fadeInUp stagger-4">
      <h2 class="section-title">📅 最近练习记录</h2>
      
      <div class="records-table" v-if="recentRecords.length > 0">
        <div class="table-header">
          <span>日期</span>
          <span>天数</span>
          <span>字符数</span>
          <span>准确率</span>
          <span>积分</span>
        </div>
        <div 
          v-for="record in recentRecords" 
          :key="record.date"
          class="table-row"
        >
          <span>{{ record.date }}</span>
          <span class="day-badge">第{{ record.day }}天</span>
          <span>{{ record.totalChars }}</span>
          <span :class="{ 'text-success': record.accuracy >= 0.9, 'text-error': record.accuracy < 0.7 }">
            {{ Math.round(record.accuracy * 100) }}%
          </span>
          <span class="points-earned">+{{ record.earnedPoints }}</span>
        </div>
      </div>
      
      <div class="no-records" v-else>
        <span class="empty-icon">📝</span>
        <span>暂无练习记录，开始练习吧！</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-page {
  padding-top: 32px;
}

.stats-overview {
  margin-bottom: 28px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 24px 20px;
}

.stat-icon-wrapper {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-bottom: 12px;
}

.stat-icon-blue {
  background: linear-gradient(135deg, rgba(84, 160, 255, 0.2), rgba(156, 136, 255, 0.15));
}

.stat-icon-orange {
  background: linear-gradient(135deg, rgba(255, 159, 67, 0.2), rgba(255, 107, 157, 0.15));
}

.stat-icon-purple {
  background: linear-gradient(135deg, rgba(156, 136, 255, 0.2), rgba(255, 107, 157, 0.15));
}

.stat-icon-green {
  background: linear-gradient(135deg, rgba(92, 216, 89, 0.2), rgba(84, 160, 255, 0.15));
}

.stat-card .stat-icon {
  font-size: 2rem;
}

.stat-card .stat-value {
  font-family: var(--font-display);
  font-size: 2.2rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--candy-orange), var(--candy-pink));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-card .stat-label {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.section {
  margin-bottom: 28px;
}

.section-title {
  font-family: var(--font-display);
}

.section-desc {
  font-family: var(--font-body);
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin-bottom: 24px;
}

.keyboard-heatmap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
}

.heatmap-row {
  display: flex;
  gap: 8px;
}

.heatmap-row.row-1 {
  margin-left: 24px;
}

.heatmap-row.row-2 {
  margin-left: 48px;
}

.heatmap-key {
  width: 54px;
  height: 54px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  cursor: default;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 3px 0 0 rgba(0, 0, 0, 0.1);
}

.heatmap-key:hover {
  transform: translateY(-4px) scale(1.1);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.key-letter {
  font-family: var(--font-keyboard);
  font-size: 1.1rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.key-accuracy {
  font-family: var(--font-body);
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.heatmap-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.finger-stats {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 20px;
}

.finger-stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.finger-bar {
  flex: 1;
  height: 28px;
  background: #f0f0f0;
  border-radius: var(--radius-pill);
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.08);
}

.finger-bar-fill {
  height: 100%;
  width: var(--bar-width);
  background: var(--finger-color);
  border-radius: var(--radius-pill);
  transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 2px 8px color-mix(in srgb, var(--finger-color) 50%, transparent);
}

.finger-info {
  min-width: 150px;
  display: flex;
  justify-content: space-between;
}

.finger-name {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.finger-accuracy {
  font-family: var(--font-display);
  font-weight: 600;
  color: var(--color-text-primary);
}

.weak-finger-tip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  background: linear-gradient(135deg, rgba(254, 202, 87, 0.2), rgba(255, 159, 67, 0.15));
  border-radius: var(--radius-lg);
  border: 1px solid rgba(254, 202, 87, 0.3);
  font-family: var(--font-body);
  color: var(--color-text-primary);
}

.tip-icon {
  font-size: 1.5rem;
}

.weak-finger-tip strong {
  color: var(--candy-orange);
}

.records-table {
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid #eee;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 12px;
  padding: 14px 20px;
  align-items: center;
}

.table-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #f0f2f5 100%);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.table-row {
  border-bottom: 1px solid #f0f0f0;
  font-family: var(--font-body);
  transition: background 0.2s ease;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background: rgba(255, 159, 67, 0.05);
}

.day-badge {
  display: inline-block;
  padding: 4px 10px;
  background: linear-gradient(135deg, var(--candy-blue), var(--candy-purple));
  color: white;
  border-radius: var(--radius-pill);
  font-size: 0.8rem;
  font-weight: 600;
}

.points-earned {
  font-family: var(--font-display);
  font-weight: 600;
  color: var(--candy-orange);
}

.no-records {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px;
  color: var(--color-text-secondary);
  font-family: var(--font-body);
}

.empty-icon {
  font-size: 3rem;
  opacity: 0.5;
}

@media (max-width: 768px) {
  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .heatmap-key {
    width: 40px;
    height: 40px;
  }
  
  .key-accuracy {
    display: none;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 1.5fr 1fr 1fr 1fr;
    font-size: 0.85rem;
    padding: 12px 14px;
  }
  
  .table-header span:nth-child(5),
  .table-row span:nth-child(5) {
    display: none;
  }
}
</style>
