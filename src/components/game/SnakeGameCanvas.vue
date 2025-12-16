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
import type { SnakeGameState, SnakeGameConfig, SnakeSegment, Direction } from '@/types'
import { DEFAULT_SNAKE_CONFIG, SNAKE_HEAD_MARKER, FRUIT_MARKER } from '@/utils/snakeGame'

interface Props {
  gameState: SnakeGameState
  config?: SnakeGameConfig
}

const props = withDefaults(defineProps<Props>(), {
  config: () => DEFAULT_SNAKE_CONFIG,
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
const animationFrameId = ref<number | null>(null)
const foodBouncePhase = ref(0)

const canvasWidth = computed(() => props.config.gridWidth * props.config.gridSize)
const canvasHeight = computed(() => props.config.gridHeight * props.config.gridSize)

// 糖果色彩虹渐变（粉→橙→黄→绿→蓝→紫）
const CANDY_COLORS = [
  { r: 255, g: 107, b: 157 },  // candy-pink
  { r: 255, g: 159, b: 67 },   // candy-orange
  { r: 254, g: 202, b: 87 },   // candy-yellow
  { r: 92, g: 216, b: 89 },    // candy-green
  { r: 84, g: 160, b: 255 },   // candy-blue
  { r: 156, g: 136, b: 255 },  // candy-purple
]

// 获取蛇身颜色（糖果色渐变）
const getSnakeColor = (index: number, total: number): string => {
  if (total <= 1) return `rgb(${CANDY_COLORS[0].r}, ${CANDY_COLORS[0].g}, ${CANDY_COLORS[0].b})`
  
  const ratio = index / (total - 1)
  const colorIndex = Math.floor(ratio * (CANDY_COLORS.length - 1))
  const nextIndex = Math.min(colorIndex + 1, CANDY_COLORS.length - 1)
  const localRatio = (ratio * (CANDY_COLORS.length - 1)) % 1
  
  const c1 = CANDY_COLORS[colorIndex]
  const c2 = CANDY_COLORS[nextIndex]
  
  const r = Math.round(c1.r + (c2.r - c1.r) * localRatio)
  const g = Math.round(c1.g + (c2.g - c1.g) * localRatio)
  const b = Math.round(c1.b + (c2.b - c1.b) * localRatio)
  
  return `rgb(${r}, ${g}, ${b})`
}

// 绘制圆角矩形
const drawRoundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

// 绘制背景（糖果色渐变 + 淡淡网格）
const drawBackground = (ctx: CanvasRenderingContext2D) => {
  // 柔和的糖果色渐变背景
  const gradient = ctx.createLinearGradient(0, 0, canvasWidth.value, canvasHeight.value)
  gradient.addColorStop(0, '#FFF5F8')   // 粉白
  gradient.addColorStop(0.5, '#F0F8FF') // 蓝白
  gradient.addColorStop(1, '#FFF8F0')   // 橙白
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvasWidth.value, canvasHeight.value)
  
  // 绘制淡淡的网格线
  const gridSize = props.config.gridSize
  ctx.strokeStyle = 'rgba(200, 180, 220, 0.12)' // 非常淡的紫粉色
  ctx.lineWidth = 1
  
  // 垂直线
  for (let x = 1; x < props.config.gridWidth; x++) {
    ctx.beginPath()
    ctx.moveTo(x * gridSize, 0)
    ctx.lineTo(x * gridSize, canvasHeight.value)
    ctx.stroke()
  }
  
  // 水平线
  for (let y = 1; y < props.config.gridHeight; y++) {
    ctx.beginPath()
    ctx.moveTo(0, y * gridSize)
    ctx.lineTo(canvasWidth.value, y * gridSize)
    ctx.stroke()
  }
}

// 绘制可爱蛇头
const drawSnakeHead = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  gridSize: number,
  direction: Direction,
  color: string
) => {
  const centerX = x + gridSize / 2
  const centerY = y + gridSize / 2
  const padding = gridSize * 0.08
  const size = gridSize - padding * 2
  
  ctx.save()
  
  // 根据方向旋转
  ctx.translate(centerX, centerY)
  switch (direction) {
    case 'up': ctx.rotate(-Math.PI / 2); break
    case 'down': ctx.rotate(Math.PI / 2); break
    case 'left': ctx.rotate(Math.PI); break
    case 'right': break // 默认朝右
  }
  ctx.translate(-centerX, -centerY)
  
  // 蛇头身体（圆角矩形）
  ctx.fillStyle = color
  ctx.shadowColor = 'rgba(0, 0, 0, 0.15)'
  ctx.shadowBlur = 4
  ctx.shadowOffsetY = 2
  drawRoundRect(ctx, x + padding, y + padding, size, size, size * 0.35)
  ctx.fill()
  ctx.shadowColor = 'transparent'
  
  // 眼睛（两个白色圆形 + 黑色瞳孔）
  const eyeY = centerY - size * 0.1
  const eyeOffsetX = size * 0.18
  const eyeRadius = size * 0.15
  const pupilRadius = size * 0.08
  
  // 左眼
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.arc(centerX - eyeOffsetX, eyeY, eyeRadius, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#2C3E50'
  ctx.beginPath()
  ctx.arc(centerX - eyeOffsetX + pupilRadius * 0.3, eyeY, pupilRadius, 0, Math.PI * 2)
  ctx.fill()
  
  // 右眼
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.arc(centerX + eyeOffsetX, eyeY, eyeRadius, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#2C3E50'
  ctx.beginPath()
  ctx.arc(centerX + eyeOffsetX + pupilRadius * 0.3, eyeY, pupilRadius, 0, Math.PI * 2)
  ctx.fill()
  
  // 舌头（可爱的红色 Y 形）
  const tongueStartX = centerX + size * 0.35
  const tongueStartY = centerY
  ctx.strokeStyle = '#FF6B6B'
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(tongueStartX, tongueStartY)
  ctx.lineTo(tongueStartX + size * 0.2, tongueStartY)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(tongueStartX + size * 0.2, tongueStartY)
  ctx.lineTo(tongueStartX + size * 0.28, tongueStartY - size * 0.08)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(tongueStartX + size * 0.2, tongueStartY)
  ctx.lineTo(tongueStartX + size * 0.28, tongueStartY + size * 0.08)
  ctx.stroke()
  
  // 腮红
  ctx.fillStyle = 'rgba(255, 150, 180, 0.4)'
  ctx.beginPath()
  ctx.ellipse(centerX - size * 0.28, centerY + size * 0.12, size * 0.1, size * 0.06, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(centerX + size * 0.28, centerY + size * 0.12, size * 0.1, size * 0.06, 0, 0, Math.PI * 2)
  ctx.fill()
  
  ctx.restore()
}

// 绘制蛇身节段
const drawSnakeSegment = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  gridSize: number,
  letter: string,
  color: string
) => {
  const padding = gridSize * 0.08
  const size = gridSize - padding * 2
  const centerX = x + gridSize / 2
  const centerY = y + gridSize / 2
  
  // 绘制圆角矩形背景
  ctx.fillStyle = color
  ctx.shadowColor = 'rgba(0, 0, 0, 0.15)'
  ctx.shadowBlur = 4
  ctx.shadowOffsetY = 2
  drawRoundRect(ctx, x + padding, y + padding, size, size, size * 0.3)
  ctx.fill()
  ctx.shadowColor = 'transparent'
  
  // 判断是否为果子
  if (letter === FRUIT_MARKER) {
    // 绘制果子 emoji
    ctx.font = `${gridSize * 0.6}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('🍎', centerX, centerY)
  } else if (letter && letter !== SNAKE_HEAD_MARKER) {
    // 绘制字母
    ctx.fillStyle = '#FFFFFF'
    ctx.font = `bold ${gridSize * 0.55}px "Fredoka", "Quicksand", sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    // 添加文字阴影
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
    ctx.shadowBlur = 2
    ctx.shadowOffsetY = 1
    ctx.fillText(letter, centerX, centerY)
    ctx.shadowColor = 'transparent'
  }
}

// 绘制蛇
const drawSnake = (ctx: CanvasRenderingContext2D) => {
  const gridSize = props.config.gridSize
  const snake = props.gameState.snake
  const direction = props.gameState.direction
  
  // 从尾部开始绘制，这样头部会在最上面
  for (let i = snake.length - 1; i >= 0; i--) {
    const segment = snake[i]
    const x = segment.x * gridSize
    const y = segment.y * gridSize
    const color = getSnakeColor(i, snake.length)
    
    if (i === 0) {
      // 蛇头
      drawSnakeHead(ctx, x, y, gridSize, direction, color)
    } else {
      // 蛇身
      drawSnakeSegment(ctx, x, y, gridSize, segment.letter, color)
    }
  }
}

// 绘制食物
const drawFood = (ctx: CanvasRenderingContext2D) => {
  if (!props.gameState.food) return
  
  const gridSize = props.config.gridSize
  const x = props.gameState.food.x * gridSize
  const y = props.gameState.food.y * gridSize
  const letter = props.gameState.food.letter
  
  const padding = gridSize * 0.1
  const size = gridSize - padding * 2
  const centerX = x + gridSize / 2
  const centerY = y + gridSize / 2
  
  // 弹跳效果
  const bounceOffset = Math.sin(foodBouncePhase.value) * 3
  
  ctx.save()
  ctx.translate(0, bounceOffset)
  
  // 绘制发光效果
  ctx.shadowColor = 'rgba(255, 200, 100, 0.5)'
  ctx.shadowBlur = 15
  
  if (letter === FRUIT_MARKER) {
    // 果子食物 - 绿色背景
    ctx.fillStyle = '#5CD859'
    drawRoundRect(ctx, x + padding, y + padding, size, size, size * 0.35)
    ctx.fill()
    ctx.shadowColor = 'transparent'
    
    // 绘制果子 emoji
    ctx.font = `${gridSize * 0.6}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('🍎', centerX, centerY)
  } else {
    // 字母食物 - 金色背景
    const gradient = ctx.createLinearGradient(x, y, x + gridSize, y + gridSize)
    gradient.addColorStop(0, '#FFD700')
    gradient.addColorStop(1, '#FFA500')
    ctx.fillStyle = gradient
    drawRoundRect(ctx, x + padding, y + padding, size, size, size * 0.35)
    ctx.fill()
    ctx.shadowColor = 'transparent'
    
    // 绘制字母
    ctx.fillStyle = '#FFFFFF'
    ctx.font = `bold ${gridSize * 0.6}px "Fredoka", "Quicksand", sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
    ctx.shadowBlur = 2
    ctx.shadowOffsetY = 1
    ctx.fillText(letter, centerX, centerY)
  }
  
  ctx.restore()
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
  drawBackground(ctx)
  
  // 绘制蛇（暂停时也显示）
  drawSnake(ctx)
  
  // 绘制食物
  drawFood(ctx)
  
  // 更新弹跳相位
  foodBouncePhase.value += 0.08
  if (foodBouncePhase.value > Math.PI * 2) {
    foodBouncePhase.value = 0
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
  border-radius: 20px;
  border: 4px solid transparent;
  background: 
    linear-gradient(white, white) padding-box,
    linear-gradient(135deg, #FF6B9D, #FF9F43, #FECA57, #5CD859, #54A0FF, #9C88FF) border-box;
  box-shadow: 
    0 8px 32px rgba(255, 107, 157, 0.2),
    0 4px 16px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.snake-game-canvas:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 12px 40px rgba(255, 107, 157, 0.25),
    0 6px 20px rgba(0, 0, 0, 0.12);
}
</style>
