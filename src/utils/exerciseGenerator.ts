import type { Finger, LetterStat } from '@/types'
import { EXERCISE_CONFIG } from '@/types'
import { 
  FINGER_TO_LETTERS, 
  FINGER_TO_CHARS,
  ALL_LETTERS, 
  ALL_NUMBERS,
  ALL_SYMBOLS,
  getAvailableChars,
  getFingerForChar
} from './fingerMapping'

// 渐进式手指安排：每2天增加2个手指
// 第1-2天：左右食指
// 第3-4天：+左右中指
// 第5-6天：+左右无名指
// 第7-8天：+左右小指
// 第9天+：全部手指
function getFingersForDay(day: number): Finger[] {
  const fingers: Finger[] = []
  
  // 第1天起：左右食指
  if (day >= 1) {
    fingers.push('left-index', 'right-index')
  }
  
  // 第3天起：+左右中指
  if (day >= 3) {
    fingers.push('left-middle', 'right-middle')
  }
  
  // 第5天起：+左右无名指
  if (day >= 5) {
    fingers.push('left-ring', 'right-ring')
  }
  
  // 第7天起：+左右小指
  if (day >= 7) {
    fingers.push('left-pinky', 'right-pinky')
  }
  
  return fingers
}

// 获取当天可用的字符类型
function getCharTypesForDay(day: number): { letters: boolean, numbers: boolean, symbols: boolean } {
  return {
    letters: true,              // 字母始终可用
    numbers: day > 30,          // 第31天开始加入数字
    symbols: day > 60,          // 第61天开始加入符号
  }
}

// 获取当天练习的所有字符
function getCharsForDay(day: number): string[] {
  const fingers = getFingersForDay(day)
  const charTypes = getCharTypesForDay(day)
  const chars: string[] = []
  
  for (const finger of fingers) {
    // 始终添加字母
    chars.push(...FINGER_TO_LETTERS[finger])
    
    // 如果是数字/符号阶段，添加该手指对应的数字/符号
    if (charTypes.numbers || charTypes.symbols) {
      const allChars = FINGER_TO_CHARS[finger]
      for (const char of allChars) {
        // 跳过已添加的字母
        if (ALL_LETTERS.includes(char)) continue
        
        // 第2个月：添加数字
        if (charTypes.numbers && ALL_NUMBERS.includes(char)) {
          chars.push(char)
        }
        
        // 第3个月：添加符号
        if (charTypes.symbols && ALL_SYMBOLS.includes(char)) {
          chars.push(char)
        }
      }
    }
  }
  
  return chars
}

// 随机打乱数组
function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// 获取弱项字符
export function getWeakLetters(
  letterStats: Record<string, LetterStat>,
  availableChars: string[] = ALL_LETTERS,
  threshold: number = EXERCISE_CONFIG.weakThreshold
): string[] {
  const weak: string[] = []
  for (const char of availableChars) {
    const stat = letterStats[char]
    if (stat && stat.totalAttempts > 0) {
      const accuracy = stat.correctAttempts / stat.totalAttempts
      if (accuracy < threshold) {
        weak.push(char)
      }
    }
  }
  return weak
}

// 生成单个字符重复序列
function generateRepeat(char: string, count: number): string[] {
  return Array(count).fill(char)
}

// 生成字符组合序列
function generateCombination(chars: string[], length: number): string[] {
  if (chars.length === 0) return []
  const result: string[] = []
  while (result.length < length) {
    result.push(...shuffle(chars))
  }
  return result.slice(0, length)
}

// 主生成函数
export function generateExercise(
  day: number,
  letterStats: Record<string, LetterStat>
): string[] {
  const minKeystrokes = EXERCISE_CONFIG.minDailyKeystrokes
  const targetChars = getCharsForDay(day)
  
  let exercises: string[] = []
  
  // 1. 基础练习：每个字符重复练习（新学的字符多练，复习的字符少练）
  const fingers = getFingersForDay(day)
  const newFingers = day >= 9 ? [] : getFingersForDay(day).slice(-2) // 最新的2个手指
  
  for (const char of targetChars) {
    const finger = getFingerForChar(char)
    // 新学的手指字符重复15次，复习的重复8次
    const repeatCount = finger && newFingers.includes(finger) ? 15 : 8
    exercises.push(...generateRepeat(char, repeatCount))
  }
  
  // 2. 组合练习：随机组合当天所有字符
  const combinationCount = Math.max(100, minKeystrokes - exercises.length)
  exercises.push(...generateCombination(targetChars, combinationCount))
  
  // 3. 弱项强化：30%比例
  const weakChars = getWeakLetters(letterStats, targetChars)
  if (weakChars.length > 0) {
    const weakCount = Math.floor(exercises.length * EXERCISE_CONFIG.weakRatio)
    exercises.push(...generateCombination(weakChars, weakCount))
  }
  
  // 确保至少达到最低按键次数
  while (exercises.length < minKeystrokes) {
    exercises.push(...generateCombination(targetChars, 50))
  }
  
  return shuffle(exercises)
}

// 获取当天练习的目标字符说明
export function getDayDescription(day: number): string {
  const fingers = getFingersForDay(day)
  const chars = getCharsForDay(day)
  const charTypes = getCharTypesForDay(day)
  
  // 阶段描述
  let phaseDesc = '字母'
  if (charTypes.symbols) {
    phaseDesc = '字母+数字+符号'
  } else if (charTypes.numbers) {
    phaseDesc = '字母+数字'
  }
  
  if (day >= 9) {
    return `综合练习 - ${chars.length} 个${phaseDesc}`
  }
  
  // 找出新增的手指
  const fingerNames: Record<Finger, string> = {
    'left-index': '左食指',
    'right-index': '右食指',
    'left-middle': '左中指',
    'right-middle': '右中指',
    'left-ring': '左无名指',
    'right-ring': '右无名指',
    'left-pinky': '左小指',
    'right-pinky': '右小指',
  }
  
  const newFingers = fingers.slice(-2) // 最新的2个手指
  const newFingerNames = newFingers.map(f => fingerNames[f]).join('、')
  
  return `练习 ${chars.length} 个${phaseDesc} (新增: ${newFingerNames})`
}

// 获取当天的阶段描述
export function getStageDescription(day: number): string {
  if (day <= 2) return '入门阶段'
  if (day <= 4) return '进阶阶段'
  if (day <= 6) return '提高阶段'
  if (day <= 8) return '冲刺阶段'
  if (day <= 30) return '字母强化'
  if (day <= 60) return '数字阶段'
  return '符号阶段'
}
