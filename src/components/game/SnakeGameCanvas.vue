<template>
  <canvas
    ref="canvasRef"
    :width="canvasWidth"
    :height="canvasHeight"
    class="snake-game-canvas"
  ></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import type { SnakeGameState, SnakeGameConfig, SnakeSegment } from '@/types'
import { DEFAULT_SNAKE_CONFIG } from '@/utils/snakeGame'

interface Props {
  gameState: SnakeGameState
  config?: SnakeGameConfig
}

const props = withDefaults(defineProps<Props>(), {
  config: () => DEFAULT_SNAKE_CONFIG,
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
const animationFrameId = ref<number | null>(null)
const foodFlashPhase = ref(0)

const canvasWidth = computed(() => props.config.gridWidth * props.config.gridSize)
const canvasHeight = computed(() => props.config.gridHeight * props.config.gridSize)

// 蛇身颜色渐变（红→橙→黄→绿→蓝→紫）
const getSnakeColor = (index: number, total: number): string => {
  if (total === 0) return '#FF0000'
  
  const ratio = index / total
  const colors = [
    { r: 255, g: 0, b: 0 },    // 红
    { r: 255, g: 165, b: 0 },  // 橙
    { r: 255, g: 255, b: 0 },  // 黄
    { r: 0, g: 255, b: 0 },    // 绿
    { r: 0, g: 0, b: 255 },    // 蓝
    { r: 128, g: 0, b: 128 },  // 紫
  ]
  
  const colorIndex = Math.floor(ratio * (colors.length - 1))
  const nextIndex = Math.min(colorIndex + 1, colors.length - 1)
  const localRatio = (ratio * (colors.length - 1)) % 1
  
  const c1 = colors[colorIndex]
  const c2 = colors[nextIndex]
  
  const r = Math.round(c1.r + (c2.r - c1.r) * localRatio)
  const g = Math.round(c1.g + (c2.g - c1.g) * localRatio)
  const b = Math.round(c1.b + (c2.b - c1.b) * localRatio)
  
  return `rgb(${r}, ${g}, ${b})`
}

// 绘制半调图案（优化，减少对字母的干扰）
const drawHalftone = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string
) => {
  ctx.fillStyle = color
  ctx.fillRect(x, y, size, size)
  
  // 添加半调点效果（减少透明度，避免干扰字母）
  const dotSize = size / 8
  const spacing = size / 4
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'  // 降低透明度
  
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if ((i + j) % 2 === 0) {
        ctx.beginPath()
        ctx.arc(x + spacing * (i + 0.5), y + spacing * (j + 0.5), dotSize / 2, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }
}

// 绘制背景网格
const drawGrid = (ctx: CanvasRenderingContext2D) => {
  const gridSize = props.config.gridSize
  
  // 背景渐变
  const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight.value)
  gradient.addColorStop(0, '#1a1a2e')
  gradient.addColorStop(1, '#16213e')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvasWidth.value, canvasHeight.value)
  
  // 网格线
  ctx.strokeStyle = 'rgba(100, 150, 200, 0.1)'
  ctx.lineWidth = 1
  
  for (let x = 0; x <= props.config.gridWidth; x++) {
    ctx.beginPath()
    ctx.moveTo(x * gridSize, 0)
    ctx.lineTo(x * gridSize, canvasHeight.value)
    ctx.stroke()
  }
  
  for (let y = 0; y <= props.config.gridHeight; y++) {
    ctx.beginPath()
    ctx.moveTo(0, y * gridSize)
    ctx.lineTo(canvasWidth.value, y * gridSize)
    ctx.stroke()
  }
}

// 绘制蛇身
const drawSnake = (ctx: CanvasRenderingContext2D) => {
  const gridSize = props.config.gridSize
  const snake = props.gameState.snake
  
  snake.forEach((segment: SnakeSegment, index: number) => {
    const x = segment.x * gridSize
    const y = segment.y * gridSize
    const color = getSnakeColor(index, snake.length)
    
    // 绘制蛇身方块
    drawHalftone(ctx, x, y, gridSize, color)
    
    // 绘制字母（优化清晰度）
    ctx.save()
    ctx.fillStyle = '#FFFFFF'
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2
    ctx.font = `bold ${gridSize * 0.7}px monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    // 先绘制描边，再绘制填充，让字母更清晰
    ctx.strokeText(
      segment.letter,
      x + gridSize / 2,
      y + gridSize / 2
    )
    ctx.fillText(
      segment.letter,
      x + gridSize / 2,
      y + gridSize / 2
    )
    ctx.restore()
    
    // 头部特殊标记
    if (index === 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.beginPath()
      ctx.arc(x + gridSize / 2, y + gridSize / 2, gridSize * 0.15, 0, Math.PI * 2)
      ctx.fill()
    }
  })
}

// 绘制食物
const drawFood = (ctx: CanvasRenderingContext2D) => {
  if (!props.gameState.food) return
  
  const gridSize = props.config.gridSize
  const x = props.gameState.food.x * gridSize
  const y = props.gameState.food.y * gridSize
  
  // 闪烁效果
  const flashIntensity = 0.5 + Math.sin(foodFlashPhase.value) * 0.5
  const baseColor = '#FFD700' // 金色
  const r = 255
  const g = Math.round(215 + flashIntensity * 40)
  const b = 0
  
  const color = `rgb(${r}, ${g}, ${b})`
  
  // 绘制食物方块
  drawHalftone(ctx, x, y, gridSize, color)
  
  // 绘制字母（优化清晰度）
  ctx.save()
  ctx.fillStyle = '#FFFFFF'
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 2
  ctx.font = `bold ${gridSize * 0.8}px monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  // 先绘制描边，再绘制填充，让字母更清晰
  ctx.strokeText(
    props.gameState.food.letter,
    x + gridSize / 2,
    y + gridSize / 2
  )
  ctx.fillText(
    props.gameState.food.letter,
    x + gridSize / 2,
    y + gridSize / 2
  )
  ctx.restore()
}

// 绘制爆炸效果
const drawExplosion = (ctx: CanvasRenderingContext2D) => {
  // 简单的爆炸效果可以在吃到食物时触发
  // 这里可以扩展为更复杂的粒子效果
}

// 渲染游戏
const render = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  // 清空画布
  ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value)
  
  // 绘制背景
  drawGrid(ctx)
  
  // 绘制蛇
  if (!props.gameState.isPaused) {
    drawSnake(ctx)
  }
  
  // 绘制食物
  drawFood(ctx)
  
  // 更新闪烁相位
  foodFlashPhase.value += 0.1
  if (foodFlashPhase.value > Math.PI * 2) {
    foodFlashPhase.value = 0
  }
}

// 动画循环
const animate = () => {
  render()
  animationFrameId.value = requestAnimationFrame(animate)
}

// 监听游戏状态变化
watch(() => props.gameState, () => {
  render()
}, { deep: true })

onMounted(() => {
  animate()
  render()
})

onUnmounted(() => {
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value)
  }
})
</script>

<style scoped>
.snake-game-canvas {
  display: block;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  border: 3px solid;
  border-image: linear-gradient(135deg, #1a1a2e, #6a4c93) 1;
  box-shadow: 0 0 20px rgba(106, 76, 147, 0.3);
  transition: box-shadow 0.3s ease;
}

.snake-game-canvas:hover {
  box-shadow: 0 0 30px rgba(106, 76, 147, 0.5);
}
</style>
