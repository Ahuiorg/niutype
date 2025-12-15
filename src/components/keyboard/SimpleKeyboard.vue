<script setup lang="ts">
import { computed } from 'vue'
import { MAC_KEYBOARD_ROWS, getFingerForChar, type KeyConfig } from '@/utils/fingerMapping'
import { FINGER_COLORS, type Finger } from '@/types'

const props = defineProps<{
  targetKey: string
  pressedKey: string
  pressResult: 'correct' | 'wrong' | null
}>()

// 手指列表
const fingers: Finger[] = [
  'left-pinky', 'left-ring', 'left-middle', 'left-index',
  'right-index', 'right-middle', 'right-ring', 'right-pinky'
]

// 手指名称
const fingerNames: Record<Finger, string> = {
  'left-pinky': '小指',
  'left-ring': '无名指',
  'left-middle': '中指',
  'left-index': '食指',
  'right-index': '食指',
  'right-middle': '中指',
  'right-ring': '无名指',
  'right-pinky': '小指'
}

// 基础键宽（px）
const BASE_KEY_WIDTH = 54
const KEY_GAP = 6

// 获取键的颜色
function getKeyColor(key: string): string {
  const finger = getFingerForChar(key)
  if (finger) {
    return FINGER_COLORS[finger]
  }
  return '#94a3b8'
}

// 判断是否为目标键
function isTargetKey(keyConfig: KeyConfig): boolean {
  if (!props.targetKey) return false
  // 空格键特殊处理
  if (keyConfig.key === 'space') {
    return props.targetKey === ' '
  }
  return keyConfig.key.toUpperCase() === props.targetKey.toUpperCase()
}

// 判断是否为按下的键
function isPressedKey(keyConfig: KeyConfig): boolean {
  if (!props.pressedKey) return false
  // 空格键特殊处理
  if (keyConfig.key === 'space') {
    return props.pressedKey === ' '
  }
  return keyConfig.key.toUpperCase() === props.pressedKey.toUpperCase()
}

// 获取按下键的反馈颜色
function getPressedColor(): string {
  if (props.pressResult === 'correct') return '#5CD859'
  if (props.pressResult === 'wrong') return '#FF6B6B'
  return ''
}

// 计算键的宽度样式
function getKeyWidth(width: number): string {
  return `${width * BASE_KEY_WIDTH + (width - 1) * KEY_GAP}px`
}

// 获取目标手指
const targetFinger = computed(() => {
  if (props.targetKey) {
    return getFingerForChar(props.targetKey)
  }
  return null
})
</script>

<template>
  <div class="simple-keyboard">
    <!-- 键盘区域 -->
    <div class="keyboard">
      <div 
        v-for="(row, rowIndex) in MAC_KEYBOARD_ROWS" 
        :key="rowIndex"
        class="keyboard-row"
      >
        <div
          v-for="keyConfig in row"
          :key="keyConfig.key"
          class="key"
          :class="{
            'target': isTargetKey(keyConfig),
            'pressed': isPressedKey(keyConfig),
            'correct': isPressedKey(keyConfig) && pressResult === 'correct',
            'wrong': isPressedKey(keyConfig) && pressResult === 'wrong',
            'function-key': keyConfig.isFunction,
            'space-key': keyConfig.key === 'space'
          }"
          :style="{
            width: getKeyWidth(keyConfig.width),
            '--key-color': keyConfig.isFunction ? '#94a3b8' : getKeyColor(keyConfig.key),
            '--pressed-color': getPressedColor()
          }"
        >
          <span 
            class="key-label" 
            :class="{ 
              'function-label': keyConfig.isFunction
            }"
          >
            {{ keyConfig.label }}
          </span>
          <span class="key-shadow"></span>
        </div>
      </div>
    </div>
    
    <!-- 底部手部指示器 -->
    <div class="hand-indicators">
      <!-- 左手 -->
      <div class="hand left-hand">
        <div class="hand-label">👈 左手</div>
        <div class="fingers">
          <div
            v-for="finger in fingers.slice(0, 4)"
            :key="finger"
            class="finger-item"
            :class="{ 'active': targetFinger === finger }"
          >
            <div 
              class="finger-dot"
              :style="{ '--finger-color': FINGER_COLORS[finger] }"
            />
            <span class="finger-name">{{ fingerNames[finger] }}</span>
          </div>
        </div>
      </div>
      
      <!-- 右手 -->
      <div class="hand right-hand">
        <div class="hand-label">右手 👉</div>
        <div class="fingers">
          <div
            v-for="finger in fingers.slice(4)"
            :key="finger"
            class="finger-item"
            :class="{ 'active': targetFinger === finger }"
          >
            <div 
              class="finger-dot"
              :style="{ '--finger-color': FINGER_COLORS[finger] }"
            />
            <span class="finger-name">{{ fingerNames[finger] }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.simple-keyboard {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  padding: 20px;
}

/* 键盘区域 */
.keyboard {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 18px;
  background: linear-gradient(145deg, #f0f0f0 0%, #e0e0e0 100%);
  border-radius: 16px;
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08),
    inset 0 2px 0 rgba(255, 255, 255, 0.6);
}

.keyboard-row {
  display: flex;
  gap: 6px;
}

/* 按键样式 - 3D 效果 */
.key {
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #ffffff 0%, #f8f8f8 50%, #f0f0f0 100%);
  border: none;
  border-radius: 8px;
  box-shadow: 
    0 4px 0 0 #c0c0c0,
    0 6px 8px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  transition: all 0.1s ease;
  position: relative;
  cursor: default;
  transform-style: preserve-3d;
}

/* 按键左右边框着色 */
.key::before {
  content: '';
  position: absolute;
  top: 4px;
  bottom: 4px;
  left: 0;
  width: 3px;
  background: var(--key-color);
  border-radius: 3px 0 0 3px;
  opacity: 0.6;
}

.key::after {
  content: '';
  position: absolute;
  top: 4px;
  bottom: 4px;
  right: 0;
  width: 3px;
  background: var(--key-color);
  border-radius: 0 3px 3px 0;
  opacity: 0.6;
}

.key-label {
  font-family: var(--font-keyboard);
  font-size: 17px;
  font-weight: 600;
  color: #333;
  user-select: none;
  position: relative;
  z-index: 1;
}

/* 功能键样式 */
.function-key {
  background: linear-gradient(180deg, #e8e8e8 0%, #d8d8d8 50%, #c8c8c8 100%);
  box-shadow: 
    0 4px 0 0 #a0a0a0,
    0 6px 8px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.function-key::before,
.function-key::after {
  opacity: 0.3;
}

.function-label {
  font-size: 18px;
  color: #555;
}

/* 空格键特殊样式 */
.space-key {
  background: linear-gradient(180deg, #f5f5f5 0%, #e8e8e8 50%, #e0e0e0 100%);
}

/* 空格键目标高亮 */
.space-key.target {
  background: linear-gradient(180deg, #e8f4ff 0%, #d0e8ff 50%, #b8dcff 100%);
  box-shadow: 
    0 4px 0 0 #54A0FF,
    0 0 20px rgba(84, 160, 255, 0.5),
    0 8px 16px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  animation: targetBounce 1.2s ease-in-out infinite;
  transform: translateY(-2px);
}

.space-key.target .key-label {
  color: #54A0FF;
  font-weight: 700;
}

.space-key.target::before,
.space-key.target::after {
  background: #54A0FF;
  opacity: 0.8;
}

/* 目标键高亮 */
.key.target:not(.function-key) {
  background: linear-gradient(180deg, #fff 0%, #fff8f0 50%, #fff0e0 100%);
  box-shadow: 
    0 4px 0 0 var(--key-color),
    0 0 20px var(--key-color),
    0 8px 16px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  animation: targetBounce 1.2s ease-in-out infinite;
  transform: translateY(-2px);
}

.key.target:not(.function-key)::before,
.key.target:not(.function-key)::after {
  opacity: 1;
  width: 4px;
}

.key.target:not(.function-key) .key-label {
  color: var(--key-color);
  font-weight: 700;
  font-size: 20px;
  text-shadow: 0 0 10px var(--key-color);
}

/* 按下效果 */
.key.pressed {
  transform: translateY(3px);
  box-shadow: 
    0 1px 0 0 #c0c0c0,
    0 2px 4px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

/* 正确按键效果 */
.key.correct {
  background: linear-gradient(180deg, #d4ffd4 0%, #b8f5b8 50%, #a0e8a0 100%);
  box-shadow: 
    0 1px 0 0 #5CD859,
    0 0 15px rgba(92, 216, 89, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.key.correct .key-label {
  color: #2d8a2d;
}

/* 错误按键效果 */
.key.wrong {
  background: linear-gradient(180deg, #ffd4d4 0%, #f5b8b8 50%, #e8a0a0 100%);
  box-shadow: 
    0 1px 0 0 #FF6B6B,
    0 0 15px rgba(255, 107, 107, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  animation: shake 0.3s ease;
}

.key.wrong .key-label {
  color: #c44;
}

/* 目标键弹跳动画 */
@keyframes targetBounce {
  0%, 100% {
    transform: translateY(-2px);
  }
  50% {
    transform: translateY(-6px);
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0) translateY(3px); }
  25% { transform: translateX(-4px) translateY(3px); }
  75% { transform: translateX(4px) translateY(3px); }
}

/* 手部指示器 */
.hand-indicators {
  display: flex;
  gap: 80px;
}

.hand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.hand-label {
  font-family: var(--font-display);
  font-size: 1rem;
  color: var(--color-text-secondary);
  font-weight: 600;
}

.fingers {
  display: flex;
  gap: 12px;
}

.finger-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.finger-item.active {
  transform: scale(1.15);
}

.finger-item.active .finger-name {
  opacity: 1;
  color: var(--color-text-primary);
  font-weight: 600;
}

/* 手指圆点 */
.finger-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--finger-color);
  opacity: 0.3;
  transition: all 0.2s ease;
  box-shadow: 
    0 3px 6px rgba(0, 0, 0, 0.15),
    inset 0 2px 4px rgba(255, 255, 255, 0.3);
}

.finger-name {
  font-family: var(--font-body);
  font-size: 0.7rem;
  color: var(--color-text-light);
  opacity: 0.7;
  transition: all 0.2s ease;
}

/* 目标手指高亮 */
.finger-item.active .finger-dot {
  opacity: 1;
  transform: scale(1.2);
  animation: fingerGlow 1s ease-in-out infinite;
  box-shadow: 
    0 0 20px var(--finger-color),
    0 4px 8px rgba(0, 0, 0, 0.2),
    inset 0 2px 4px rgba(255, 255, 255, 0.4);
}

@keyframes fingerGlow {
  0%, 100% {
    box-shadow: 
      0 0 15px var(--finger-color),
      0 4px 8px rgba(0, 0, 0, 0.2);
  }
  50% {
    box-shadow: 
      0 0 25px var(--finger-color),
      0 4px 12px rgba(0, 0, 0, 0.25);
  }
}

/* 响应式 */
@media (max-width: 900px) {
  .keyboard {
    transform: scale(0.85);
    transform-origin: center top;
  }
  
  .hand-indicators {
    gap: 40px;
  }
  
  .fingers {
    gap: 8px;
  }
  
  .finger-dot {
    width: 24px;
    height: 24px;
  }
}
</style>
