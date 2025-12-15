import type { SnakeGameState, SnakeGameConfig, Direction, SnakeSegment } from '@/types'

// 26个英文字母
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

// 默认游戏配置
export const DEFAULT_SNAKE_CONFIG: SnakeGameConfig = {
  gridSize: 35,  // 格子大小
  gridWidth: 20,  // 游戏区域宽度
  gridHeight: 20,  // 游戏区域高度
  initialLength: 4,
  moveSpeed: 300,  // 基础速度（会根据长度动态调整）
  scorePerLetter: 10,
}

// 挑战成功长度
export const CHALLENGE_SUCCESS_LENGTH = 50

// 根据蛇的长度计算移动速度（数值越小，移动越快）
export function getMoveSpeedByLength(length: number): number {
  if (length < 10) {
    return 300  // 10格以下：300ms（最慢）
  } else if (length < 20) {
    return 200  // 10-20格：200ms（更快）
  } else if (length < 30) {
    return 160  // 20-30格：160ms（更快）
  } else {
    // 30格以上继续加速，每10格减少20ms，最低100ms
    const speed = 160 - Math.floor((length - 30) / 10) * 20
    return Math.max(100, speed)  // 最快100ms，不再加速
  }
}

// 生成随机字母
export function generateRandomLetter(): string {
  return LETTERS[Math.floor(Math.random() * LETTERS.length)]
}

// 生成多个随机字母
export function generateRandomLetters(count: number): string[] {
  const letters: string[] = []
  for (let i = 0; i < count; i++) {
    letters.push(generateRandomLetter())
  }
  return letters
}

// 初始化游戏状态
export function initSnakeGame(config: SnakeGameConfig = DEFAULT_SNAKE_CONFIG): SnakeGameState {
  const centerX = Math.floor(config.gridWidth / 2)
  const centerY = Math.floor(config.gridHeight / 2)
  
  // 生成初始蛇身字母
  const initialLetters = generateRandomLetters(config.initialLength)
  
  // 创建初始蛇身（水平排列）
  const snake: SnakeSegment[] = []
  for (let i = 0; i < config.initialLength; i++) {
    snake.push({
      x: centerX - i,
      y: centerY,
      letter: initialLetters[i],
    })
  }

  return {
    snake,
    food: null,
    direction: 'right',
    nextDirection: null,
    score: 0,
    isGameOver: false,
    isPaused: true,  // 初始状态为暂停，需要按空格开始
  }
}

// 生成食物（不与蛇身重叠）
export function generateFood(
  snake: SnakeSegment[],
  config: SnakeGameConfig = DEFAULT_SNAKE_CONFIG
): { x: number; y: number; letter: string } | null {
  const occupied = new Set<string>()
  for (const segment of snake) {
    occupied.add(`${segment.x},${segment.y}`)
  }

  const available: Array<{ x: number; y: number }> = []
  for (let x = 0; x < config.gridWidth; x++) {
    for (let y = 0; y < config.gridHeight; y++) {
      if (!occupied.has(`${x},${y}`)) {
        available.push({ x, y })
      }
    }
  }

  if (available.length === 0) {
    return null
  }

  const position = available[Math.floor(Math.random() * available.length)]
  return {
    x: position.x,
    y: position.y,
    letter: generateRandomLetter(),
  }
}

// 检查位置是否在蛇身上
function isPositionOnSnake(x: number, y: number, snake: SnakeSegment[]): boolean {
  return snake.some(segment => segment.x === x && segment.y === y)
}

// 移动蛇
export function moveSnake(
  state: SnakeGameState,
  config: SnakeGameConfig = DEFAULT_SNAKE_CONFIG
): SnakeGameState & { ateFood?: boolean } {
  if (state.isGameOver || state.isPaused) {
    return state
  }

  // 更新方向
  let direction = state.direction
  if (state.nextDirection) {
    // 检查是否可以改变方向（不能立即反向）
    const opposite: Record<Direction, Direction> = {
      up: 'down',
      down: 'up',
      left: 'right',
      right: 'left',
    }
    if (state.nextDirection !== opposite[direction]) {
      direction = state.nextDirection
    }
  }

  // 计算新头部位置
  const head = state.snake[0]
  let newHeadX = head.x
  let newHeadY = head.y

  switch (direction) {
    case 'up':
      newHeadY -= 1
      break
    case 'down':
      newHeadY += 1
      break
    case 'left':
      newHeadX -= 1
      break
    case 'right':
      newHeadX += 1
      break
  }

  // 检查碰撞（墙壁）
  if (
    newHeadX < 0 ||
    newHeadX >= config.gridWidth ||
    newHeadY < 0 ||
    newHeadY >= config.gridHeight
  ) {
    return {
      ...state,
      isGameOver: true,
    }
  }

  // 检查碰撞（自身）
  if (isPositionOnSnake(newHeadX, newHeadY, state.snake)) {
    return {
      ...state,
      isGameOver: true,
    }
  }

  // 检查是否吃到食物
  let newSnake = [...state.snake]
  let newFood = state.food
  let newScore = state.score
  let ateFood = false

  if (newFood && newHeadX === newFood.x && newHeadY === newFood.y) {
    // 吃到食物，增长蛇身
    newSnake.unshift({
      x: newHeadX,
      y: newHeadY,
      letter: newFood.letter, // 被吃的字母成为新节段
    })
    newScore += config.scorePerLetter
    ateFood = true
    // 生成新食物
    newFood = generateFood(newSnake, config)
  } else {
    // 没吃到食物，移动蛇身
    newSnake.unshift({
      x: newHeadX,
      y: newHeadY,
      letter: head.letter, // 头部字母保持不变
    })
    newSnake.pop() // 移除尾部
  }

  return {
    ...state,
    snake: newSnake,
    food: newFood || (ateFood ? generateFood(newSnake, config) : state.food),
    direction,
    nextDirection: null,
    score: newScore,
    ateFood, // 用于触发特效
  }
}

// 改变方向
export function changeDirection(
  state: SnakeGameState,
  newDirection: Direction
): SnakeGameState {
  if (state.isGameOver || state.isPaused) {
    return state
  }

  return {
    ...state,
    nextDirection: newDirection,
  }
}

// 暂停/继续游戏
export function togglePause(state: SnakeGameState): SnakeGameState {
  if (state.isGameOver) {
    return state
  }

  return {
    ...state,
    isPaused: !state.isPaused,
  }
}

// 重置游戏
export function resetGame(config: SnakeGameConfig = DEFAULT_SNAKE_CONFIG): SnakeGameState {
  const newState = initSnakeGame(config)
  newState.food = generateFood(newState.snake, config)
  return newState
}
