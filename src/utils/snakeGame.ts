import type { SnakeGameState, SnakeGameConfig, Direction, SnakeSegment, WordQueue } from '@/types'

// 26个英文字母
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

// 蛇头标记（用于渲染时识别蛇头）
export const SNAKE_HEAD_MARKER = ''

// 果子标记（用于单词间隔）
export const FRUIT_MARKER = '🍎'

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
    return 350  // 10格以下：300ms（最慢）
  } else if (length < 20) {
    return 250  // 10-20格：200ms（更快）
  } else if (length < 30) {
    return 200  // 20-30格：160ms（更快）
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
  
  // 生成初始蛇身字母（蛇头不需要字母）
  const initialLetters = generateRandomLetters(config.initialLength - 1)
  
  // 创建初始蛇身（水平排列）
  const snake: SnakeSegment[] = []
  
  // 蛇头（使用空字符串标记，渲染时显示图标）
  snake.push({
    x: centerX,
    y: centerY,
    letter: SNAKE_HEAD_MARKER,
  })
  
  // 蛇身（随机字母）
  for (let i = 1; i < config.initialLength; i++) {
    snake.push({
      x: centerX - i,
      y: centerY,
      letter: initialLetters[i - 1],
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

// 初始化单词队列
export function initWordQueue(words: string[]): WordQueue {
  return {
    words,
    currentWordIndex: 0,
    currentLetterIndex: 0,
  }
}

// 从单词队列获取下一个字母（或果子分隔符）
export function getNextLetterFromQueue(queue: WordQueue): { letter: string; newQueue: WordQueue } {
  const { words, currentWordIndex, currentLetterIndex } = queue
  
  if (words.length === 0) {
    // 没有单词，返回随机字母
    return {
      letter: generateRandomLetter(),
      newQueue: queue,
    }
  }
  
  const currentWord = words[currentWordIndex]
  
  // 当前单词还有字母
  if (currentLetterIndex < currentWord.length) {
    return {
      letter: currentWord[currentLetterIndex],
      newQueue: {
        ...queue,
        currentLetterIndex: currentLetterIndex + 1,
      },
    }
  }
  
  // 当前单词结束，返回果子分隔符，并移动到下一个单词
  const nextWordIndex = (currentWordIndex + 1) % words.length
  return {
    letter: FRUIT_MARKER,
    newQueue: {
      words,
      currentWordIndex: nextWordIndex,
      currentLetterIndex: 0,
    },
  }
}

// 生成食物位置（不与蛇身重叠）
function generateFoodPosition(
  snake: SnakeSegment[],
  config: SnakeGameConfig
): { x: number; y: number } | null {
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

  return available[Math.floor(Math.random() * available.length)]
}

// 生成食物（不与蛇身重叠）- 随机字母模式
export function generateFood(
  snake: SnakeSegment[],
  config: SnakeGameConfig = DEFAULT_SNAKE_CONFIG
): { x: number; y: number; letter: string } | null {
  const position = generateFoodPosition(snake, config)
  if (!position) return null

  return {
    x: position.x,
    y: position.y,
    letter: generateRandomLetter(),
  }
}

// 生成食物（单词库模式）
export function generateFoodFromQueue(
  snake: SnakeSegment[],
  queue: WordQueue,
  config: SnakeGameConfig = DEFAULT_SNAKE_CONFIG
): { food: { x: number; y: number; letter: string } | null; newQueue: WordQueue } {
  const position = generateFoodPosition(snake, config)
  if (!position) {
    return { food: null, newQueue: queue }
  }

  const { letter, newQueue } = getNextLetterFromQueue(queue)
  return {
    food: {
      x: position.x,
      y: position.y,
      letter,
    },
    newQueue,
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
  let newSnake: SnakeSegment[] = []
  let newFood = state.food
  let newScore = state.score
  let ateFood = false
  let newWordQueue = state.wordQueue

  if (newFood && newHeadX === newFood.x && newHeadY === newFood.y) {
    // 吃到食物，增长蛇身
    // 新头部移动到食物位置（蛇头标记）
    newSnake.push({
      x: newHeadX,
      y: newHeadY,
      letter: SNAKE_HEAD_MARKER,
    })
    // 原头部位置变成食物字母
    newSnake.push({
      x: head.x,
      y: head.y,
      letter: newFood.letter,
    })
    // 复制其余蛇身节段（保持原有字母）
    for (let i = 1; i < state.snake.length; i++) {
      newSnake.push({ ...state.snake[i] })
    }
    newScore += config.scorePerLetter
    ateFood = true
    
    // 生成新食物（根据是否有单词队列）
    if (state.wordQueue) {
      const result = generateFoodFromQueue(newSnake, state.wordQueue, config)
      newFood = result.food
      newWordQueue = result.newQueue
    } else {
      newFood = generateFood(newSnake, config)
    }
  } else {
    // 没吃到食物，移动蛇身
    // 新头部（蛇头标记）
    newSnake.push({
      x: newHeadX,
      y: newHeadY,
      letter: SNAKE_HEAD_MARKER,
    })
    // 复制蛇身节段（除了最后一个，保持原有字母）
    for (let i = 1; i < state.snake.length; i++) {
      newSnake.push({
        x: state.snake[i - 1].x,
        y: state.snake[i - 1].y,
        letter: state.snake[i].letter,
      })
    }
  }

  return {
    ...state,
    snake: newSnake,
    food: newFood || state.food,
    direction,
    nextDirection: null,
    score: newScore,
    wordQueue: newWordQueue,
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

// 重置游戏（随机字母模式）
export function resetGame(config: SnakeGameConfig = DEFAULT_SNAKE_CONFIG): SnakeGameState {
  const newState = initSnakeGame(config)
  newState.food = generateFood(newState.snake, config)
  return newState
}

// 初始化游戏（单词库模式）
export function initSnakeGameWithWords(
  words: string[],
  config: SnakeGameConfig = DEFAULT_SNAKE_CONFIG
): SnakeGameState {
  const state = initSnakeGame(config)
  const wordQueue = initWordQueue(words)
  const { food, newQueue } = generateFoodFromQueue(state.snake, wordQueue, config)
  
  return {
    ...state,
    food,
    wordQueue: newQueue,
  }
}

// 重置游戏（单词库模式）
export function resetGameWithWords(
  words: string[],
  config: SnakeGameConfig = DEFAULT_SNAKE_CONFIG
): SnakeGameState {
  return initSnakeGameWithWords(words, config)
}
