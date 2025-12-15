<script setup lang="ts">
import { computed } from 'vue'

interface InputChar {
  char: string
  correct: boolean
}

const props = defineProps<{
  targetChars: string[]    // 待输入的字符数组（已包含空格）
  inputChars: InputChar[]  // 已输入的字符（含正确/错误状态）
  currentIndex: number     // 当前输入位置
}>()

// 显示的字符数量
const DISPLAY_COUNT = 36

// 获取当前显示窗口的起始位置
const windowStart = computed(() => {
  // 保持当前字符在可见区域内
  const halfWindow = Math.floor(DISPLAY_COUNT / 2)
  let start = props.currentIndex - halfWindow
  
  // 确保不超出范围
  if (start < 0) start = 0
  if (start + DISPLAY_COUNT > props.targetChars.length) {
    start = Math.max(0, props.targetChars.length - DISPLAY_COUNT)
  }
  
  return start
})

// 显示的目标字符（上行）- 空格已经在练习内容中，直接显示
const displayTargetChars = computed(() => {
  return props.targetChars.slice(windowStart.value, windowStart.value + DISPLAY_COUNT)
})

// 显示的输入字符（下行）
const displayInputChars = computed(() => {
  const result: { char: string, status: 'correct' | 'wrong' | 'pending' | 'current', isSpace: boolean }[] = []
  
  for (let i = 0; i < DISPLAY_COUNT; i++) {
    const actualIndex = windowStart.value + i
    
    if (actualIndex >= props.targetChars.length) break
    
    const targetChar = props.targetChars[actualIndex]
    const isSpace = targetChar === ' '
    
    if (actualIndex < props.inputChars.length) {
      // 已输入
      const input = props.inputChars[actualIndex]
      result.push({
        char: isSpace ? '␣' : input.char,  // 空格显示为特殊符号
        status: input.correct ? 'correct' : 'wrong',
        isSpace
      })
    } else if (actualIndex === props.currentIndex) {
      // 当前位置
      result.push({
        char: isSpace ? '␣' : '_',
        status: 'current',
        isSpace
      })
    } else {
      // 未输入
      result.push({
        char: isSpace ? '␣' : '_',
        status: 'pending',
        isSpace
      })
    }
  }
  
  return result
})

// 当前高亮位置（在显示数组中的位置）
const highlightIndex = computed(() => {
  return props.currentIndex - windowStart.value
})
</script>

<template>
  <div class="typing-display">
    <!-- 上行：待输入字符 -->
    <div class="target-line">
      <span 
        v-for="(char, index) in displayTargetChars" 
        :key="'target-' + index"
        :class="[
          'char',
          { 'space': char === ' ' },
          { 'highlight': index === highlightIndex }
        ]"
      >{{ char === ' ' ? '␣' : char }}</span>
    </div>
    
    <!-- 下行：已输入字符 -->
    <div class="input-line">
      <span 
        v-for="(item, index) in displayInputChars" 
        :key="'input-' + index"
        :class="[
          'char',
          'status-' + item.status,
          { 'space': item.isSpace }
        ]"
      >{{ item.char }}</span>
    </div>
  </div>
</template>

<style scoped>
.typing-display {
  font-family: 'JetBrains Mono', 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
  background: #1e1e2e;
  border-radius: 12px;
  padding: 24px 32px;
  box-shadow: 
    0 4px 24px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.target-line,
.input-line {
  display: flex;
  justify-content: center;
  letter-spacing: 0.1em;
}

.target-line {
  margin-bottom: 8px;
}

.char {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.6em;
  height: 1.8em;
  font-size: 1.5rem;
  font-weight: 500;
  transition: all 0.15s ease;
}

/* 空格字符样式 */
.char.space {
  width: 1.6em;
  opacity: 0.6;
  font-size: 1.2rem;
}

/* 上行字符 */
.target-line .char {
  color: #a6adc8;
}

.target-line .char.highlight {
  color: #89dceb;
  background: rgba(137, 220, 235, 0.15);
  border-radius: 4px;
  transform: scale(1.1);
  font-weight: 700;
}

.target-line .char.highlight.space {
  background: rgba(137, 220, 235, 0.1);
}

/* 下行字符 */
.input-line .char {
  color: #6c7086;
}

.input-line .char.status-correct {
  color: #a6e3a1;
  font-weight: 600;
}

.input-line .char.status-wrong {
  color: #f38ba8;
  font-weight: 600;
  text-decoration: line-through;
  text-decoration-color: rgba(243, 139, 168, 0.5);
}

.input-line .char.status-current {
  color: #89dceb;
  animation: blink 1s ease-in-out infinite;
}

.input-line .char.status-pending {
  color: #45475a;
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0.3;
  }
}

/* 响应式 */
@media (max-width: 900px) {
  .char {
    width: 1.4em;
    font-size: 1.2rem;
  }
  
  .char.space {
    font-size: 1rem;
  }
}
</style>
