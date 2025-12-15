<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import Modal from '@/components/common/Modal.vue'

const userStore = useUserStore()

const showAddModal = ref(false)
const showRedeemModal = ref(false)
const selectedGift = ref<any>(null)

const newGift = ref({
  name: '',
  points: 100,
})

const pendingGifts = computed(() => {
  return userStore.userData.redeemedGifts.filter(g => !g.claimedAt)
})

const claimedGifts = computed(() => {
  return userStore.userData.redeemedGifts.filter(g => g.claimedAt)
})

function addGift() {
  if (!newGift.value.name || newGift.value.points <= 0) return
  
  userStore.addGift(newGift.value.name, newGift.value.points)
  newGift.value = { name: '', points: 100 }
  showAddModal.value = false
}

function confirmRedeem(gift: any) {
  selectedGift.value = gift
  showRedeemModal.value = true
}

function redeem() {
  if (!selectedGift.value) return
  
  const success = userStore.redeemGift(selectedGift.value.id)
  if (success) {
    showRedeemModal.value = false
    selectedGift.value = null
  }
}

function claimGift(redeemedId: string) {
  userStore.claimGift(redeemedId)
}

function removeGift(giftId: string) {
  if (confirm('确定要删除这个礼物吗？')) {
    userStore.removeGift(giftId)
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}
</script>

<template>
  <div class="page-container gift-shop-page">
    <h1 class="page-title animate-fadeInUp">🎁 礼物商店</h1>
    
    <!-- 积分显示 -->
    <div class="points-display card animate-fadeInUp stagger-1">
      <div class="points-main">
        <div class="points-icon-wrapper">
          <span class="points-star">⭐</span>
          <span class="points-sparkle">✨</span>
        </div>
        <div class="points-detail">
          <span class="points-value">{{ userStore.availablePoints }}</span>
          <span class="points-label">可用积分</span>
        </div>
      </div>
      <div class="points-stats">
        <div class="stat">
          <span class="stat-value">{{ userStore.userData.totalPoints }}</span>
          <span class="stat-label">总获得</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat">
          <span class="stat-value">{{ userStore.userData.usedPoints }}</span>
          <span class="stat-label">已使用</span>
        </div>
      </div>
    </div>
    
    <!-- 待领取礼物 -->
    <div class="section animate-fadeInUp stagger-2" v-if="pendingGifts.length > 0">
      <h2 class="section-title">📦 待领取的礼物</h2>
      <div class="pending-gifts">
        <div 
          v-for="gift in pendingGifts" 
          :key="gift.id"
          class="pending-gift-card card"
        >
          <div class="gift-icon-animated">🎁</div>
          <div class="gift-info">
            <span class="gift-name">{{ gift.giftName }}</span>
            <span class="gift-date">兑换于 {{ formatDate(gift.redeemedAt) }}</span>
          </div>
          <button class="btn btn-success claim-btn" @click="claimGift(gift.id)">
            ✓ 确认领取
          </button>
        </div>
      </div>
    </div>
    
    <!-- 可兑换礼物 -->
    <div class="section animate-fadeInUp stagger-3">
      <div class="section-header">
        <h2 class="section-title">🛒 可兑换礼物</h2>
        <button class="btn btn-secondary add-btn" @click="showAddModal = true">
          <span>+</span> 添加礼物
        </button>
      </div>
      
      <div class="gifts-grid" v-if="userStore.userData.gifts.length > 0">
        <div 
          v-for="(gift, index) in userStore.userData.gifts" 
          :key="gift.id"
          class="gift-card card"
          :style="{ animationDelay: `${0.1 + index * 0.05}s` }"
        >
          <button class="remove-btn" @click="removeGift(gift.id)" title="删除">×</button>
          <div class="gift-image">
            <span class="gift-emoji">🎁</span>
            <span class="gift-ribbon">🎀</span>
          </div>
          <div class="gift-content">
            <h3 class="gift-name">{{ gift.name }}</h3>
            <div class="gift-points">
              <span class="points-icon">⭐</span>
              <span>{{ gift.points }}</span>
            </div>
          </div>
          <button 
            class="btn btn-primary redeem-btn"
            :class="{ 'not-enough': userStore.availablePoints < gift.points }"
            :disabled="userStore.availablePoints < gift.points"
            @click="confirmRedeem(gift)"
          >
            <template v-if="userStore.availablePoints < gift.points">
              还差 {{ gift.points - userStore.availablePoints }} 分
            </template>
            <template v-else>
              立即兑换 🎉
            </template>
          </button>
        </div>
      </div>
      
      <div class="empty-gifts card" v-else>
        <div class="empty-illustration">
          <span class="empty-gift">🎁</span>
          <span class="empty-question">?</span>
        </div>
        <p class="empty-title">还没有礼物哦~</p>
        <p class="empty-hint">点击"添加礼物"来设置奖励吧！</p>
        <button class="btn btn-primary" @click="showAddModal = true">
          + 添加第一个礼物
        </button>
      </div>
    </div>
    
    <!-- 已领取历史 -->
    <div class="section animate-fadeInUp stagger-4" v-if="claimedGifts.length > 0">
      <h2 class="section-title">📜 领取历史</h2>
      <div class="history-list">
        <div 
          v-for="gift in claimedGifts" 
          :key="gift.id"
          class="history-item"
        >
          <span class="history-icon">✅</span>
          <span class="history-name">{{ gift.giftName }}</span>
          <span class="history-points">{{ gift.points }} 积分</span>
          <span class="history-date">{{ formatDate(gift.claimedAt!) }}</span>
        </div>
      </div>
    </div>
    
    <!-- 添加礼物弹窗 -->
    <Modal :show="showAddModal" title="✨ 添加新礼物" @close="showAddModal = false">
      <div class="add-gift-form">
        <div class="form-group">
          <label>礼物名称</label>
          <input 
            v-model="newGift.name" 
            type="text" 
            placeholder="例如：冰淇淋、看动画片30分钟"
            class="form-input"
          />
        </div>
        <div class="form-group">
          <label>所需积分</label>
          <input 
            v-model.number="newGift.points" 
            type="number" 
            min="1"
            class="form-input"
          />
        </div>
        <div class="form-hint">
          <span>💡</span>
          <span>建议设置 50-500 积分的礼物，更容易达成目标！</span>
        </div>
      </div>
      <template #footer>
        <button class="btn btn-secondary" @click="showAddModal = false">取消</button>
        <button 
          class="btn btn-primary" 
          @click="addGift"
          :disabled="!newGift.name || newGift.points <= 0"
        >
          添加礼物 🎁
        </button>
      </template>
    </Modal>
    
    <!-- 确认兑换弹窗 -->
    <Modal :show="showRedeemModal" title="🎉 确认兑换" @close="showRedeemModal = false">
      <div class="redeem-confirm" v-if="selectedGift">
        <div class="confirm-gift">
          <div class="confirm-gift-icon">🎁</div>
          <span class="confirm-name">{{ selectedGift.name }}</span>
        </div>
        <div class="confirm-details">
          <div class="confirm-row">
            <span>消耗积分</span>
            <span class="confirm-cost">-{{ selectedGift.points }} ⭐</span>
          </div>
          <div class="confirm-row">
            <span>兑换后剩余</span>
            <span class="confirm-balance">{{ userStore.availablePoints - selectedGift.points }} ⭐</span>
          </div>
        </div>
      </div>
      <template #footer>
        <button class="btn btn-secondary" @click="showRedeemModal = false">再想想</button>
        <button class="btn btn-primary" @click="redeem">确认兑换 ✨</button>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.gift-shop-page {
  padding-top: 32px;
}

/* 积分显示 */
.points-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28px 32px;
  margin-bottom: 36px;
  background: linear-gradient(135deg, var(--candy-orange) 0%, var(--candy-pink) 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

.points-display::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
  border-radius: 50%;
}

.points-main {
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  z-index: 1;
}

.points-icon-wrapper {
  position: relative;
}

.points-star {
  font-size: 4rem;
  animation: pulse 2s ease-in-out infinite;
}

.points-sparkle {
  position: absolute;
  top: -5px;
  right: -5px;
  font-size: 1.5rem;
  animation: twinkle 1.5s ease-in-out infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.points-detail {
  display: flex;
  flex-direction: column;
}

.points-value {
  font-family: var(--font-display);
  font-size: 3rem;
  font-weight: 800;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.points-label {
  font-family: var(--font-body);
  font-size: 1rem;
  opacity: 0.9;
}

.points-stats {
  display: flex;
  gap: 24px;
  align-items: center;
  position: relative;
  z-index: 1;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.3);
}

.points-stats .stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.points-stats .stat-value {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
}

.points-stats .stat-label {
  font-family: var(--font-body);
  font-size: 0.8rem;
  opacity: 0.85;
}

/* 区块 */
.section {
  margin-bottom: 36px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-family: var(--font-display);
  margin-bottom: 0;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 6px;
}

.add-btn span {
  font-size: 1.2rem;
  font-weight: bold;
}

/* 待领取礼物 */
.pending-gifts {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.pending-gift-card {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 20px 24px;
  background: linear-gradient(135deg, rgba(92, 216, 89, 0.1) 0%, rgba(84, 160, 255, 0.1) 100%);
  border: 2px solid var(--candy-green);
}

.gift-icon-animated {
  font-size: 2.5rem;
  animation: bounce 1s ease-in-out infinite;
}

.pending-gift-card .gift-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.pending-gift-card .gift-name {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--color-text-primary);
}

.pending-gift-card .gift-date {
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.claim-btn {
  padding: 12px 24px;
}

/* 礼物网格 */
.gifts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.gift-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28px 20px;
  text-align: center;
  position: relative;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.gift-card:hover {
  transform: translateY(-8px);
}

.remove-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border: none;
  border-radius: 50%;
  font-size: 1.2rem;
  color: var(--color-text-secondary);
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
}

.gift-card:hover .remove-btn {
  opacity: 1;
}

.remove-btn:hover {
  background: var(--color-error);
  color: white;
}

.gift-image {
  position: relative;
  margin-bottom: 16px;
}

.gift-emoji {
  font-size: 4.5rem;
}

.gift-ribbon {
  position: absolute;
  top: -10px;
  right: -10px;
  font-size: 1.5rem;
  animation: wiggle 2s ease-in-out infinite;
}

@keyframes wiggle {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}

.gift-content {
  margin-bottom: 18px;
}

.gift-card .gift-name {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 10px;
}

.gift-points {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--candy-orange), var(--candy-pink));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.gift-points .points-icon {
  font-size: 1.2rem;
  -webkit-text-fill-color: initial;
}

.redeem-btn {
  width: 100%;
}

.redeem-btn.not-enough {
  background: linear-gradient(135deg, #a0a0a0, #888888);
  box-shadow: none;
}

/* 空状态 */
.empty-gifts {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 56px 32px;
  text-align: center;
}

.empty-illustration {
  position: relative;
  margin-bottom: 20px;
}

.empty-gift {
  font-size: 5rem;
  opacity: 0.4;
}

.empty-question {
  position: absolute;
  top: 0;
  right: -10px;
  font-size: 2rem;
  color: var(--candy-orange);
  animation: bounce 2s ease-in-out infinite;
}

.empty-title {
  font-family: var(--font-display);
  font-size: 1.3rem;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.empty-hint {
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: var(--color-text-secondary);
  margin-bottom: 24px;
}

/* 历史记录 */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: linear-gradient(135deg, #f8f9fa 0%, #f0f2f5 100%);
  border-radius: var(--radius-lg);
  font-family: var(--font-body);
  transition: all 0.2s ease;
}

.history-item:hover {
  background: linear-gradient(135deg, #fff5f8 0%, #f0f8ff 100%);
}

.history-icon {
  font-size: 1.3rem;
}

.history-name {
  flex: 1;
  font-family: var(--font-display);
  font-weight: 600;
}

.history-points {
  color: var(--candy-orange);
  font-weight: 600;
}

.history-date {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

/* 表单样式 */
.add-gift-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 320px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-family: var(--font-display);
  font-weight: 600;
  color: var(--color-text-primary);
}

.form-input {
  padding: 14px 16px;
  border: 2px solid #e8e8e8;
  border-radius: var(--radius-lg);
  font-family: var(--font-body);
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--candy-orange);
  box-shadow: 0 0 0 3px rgba(255, 159, 67, 0.1);
}

.form-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background: linear-gradient(135deg, rgba(254, 202, 87, 0.15), rgba(255, 159, 67, 0.1));
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

/* 确认弹窗 */
.redeem-confirm {
  text-align: center;
  min-width: 300px;
}

.confirm-gift {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.confirm-gift-icon {
  font-size: 5rem;
  animation: bounce 1s ease-in-out infinite;
}

.confirm-name {
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.confirm-details {
  background: linear-gradient(135deg, #f8f9fa 0%, #f0f2f5 100%);
  border-radius: var(--radius-lg);
  padding: 16px 20px;
}

.confirm-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  font-family: var(--font-body);
}

.confirm-row:first-child {
  border-bottom: 1px solid #e8e8e8;
}

.confirm-cost {
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--candy-pink);
}

.confirm-balance {
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--candy-orange);
}

@media (max-width: 768px) {
  .points-display {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .points-main {
    flex-direction: column;
    gap: 12px;
  }
  
  .gifts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
