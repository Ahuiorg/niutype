import type { Finger } from '@/types'

// 字符到手指的映射（含字母、数字、符号）
export const CHAR_TO_FINGER: Record<string, Finger> = {
  // 左手小指 - 字母
  'Q': 'left-pinky',
  'A': 'left-pinky',
  'Z': 'left-pinky',
  // 左手小指 - 数字符号
  '`': 'left-pinky',
  '~': 'left-pinky',
  '1': 'left-pinky',
  '!': 'left-pinky',
  
  // 左手无名指 - 字母
  'W': 'left-ring',
  'S': 'left-ring',
  'X': 'left-ring',
  // 左手无名指 - 数字符号
  '2': 'left-ring',
  '@': 'left-ring',
  
  // 左手中指 - 字母
  'E': 'left-middle',
  'D': 'left-middle',
  'C': 'left-middle',
  // 左手中指 - 数字符号
  '3': 'left-middle',
  '#': 'left-middle',
  
  // 左手食指 - 字母
  'R': 'left-index',
  'F': 'left-index',
  'V': 'left-index',
  'T': 'left-index',
  'G': 'left-index',
  'B': 'left-index',
  // 左手食指 - 数字符号
  '4': 'left-index',
  '$': 'left-index',
  '5': 'left-index',
  '%': 'left-index',
  
  // 右手食指 - 字母
  'Y': 'right-index',
  'H': 'right-index',
  'N': 'right-index',
  'U': 'right-index',
  'J': 'right-index',
  'M': 'right-index',
  // 右手食指 - 数字符号
  '6': 'right-index',
  '^': 'right-index',
  '7': 'right-index',
  '&': 'right-index',
  
  // 右手中指 - 字母
  'I': 'right-middle',
  'K': 'right-middle',
  // 右手中指 - 符号
  ',': 'right-middle',
  '<': 'right-middle',
  '8': 'right-middle',
  '*': 'right-middle',
  
  // 右手无名指 - 字母
  'O': 'right-ring',
  'L': 'right-ring',
  // 右手无名指 - 符号
  '.': 'right-ring',
  '>': 'right-ring',
  '9': 'right-ring',
  '(': 'right-ring',
  
  // 右手小指 - 字母
  'P': 'right-pinky',
  // 右手小指 - 数字符号
  '0': 'right-pinky',
  ')': 'right-pinky',
  '-': 'right-pinky',
  '_': 'right-pinky',
  '=': 'right-pinky',
  '+': 'right-pinky',
  '[': 'right-pinky',
  '{': 'right-pinky',
  ']': 'right-pinky',
  '}': 'right-pinky',
  '\\': 'right-pinky',
  '|': 'right-pinky',
  ';': 'right-pinky',
  ':': 'right-pinky',
  "'": 'right-pinky',
  '"': 'right-pinky',
  '/': 'right-pinky',
  '?': 'right-pinky',
}

// 兼容旧API: 字母到手指的映射
export const LETTER_TO_FINGER = CHAR_TO_FINGER

// 手指到字符的映射
export const FINGER_TO_CHARS: Record<Finger, string[]> = {
  'left-pinky': ['Q', 'A', 'Z', '`', '1'],
  'left-ring': ['W', 'S', 'X', '2'],
  'left-middle': ['E', 'D', 'C', '3'],
  'left-index': ['R', 'F', 'V', 'T', 'G', 'B', '4', '5'],
  'right-index': ['Y', 'H', 'N', 'U', 'J', 'M', '6', '7'],
  'right-middle': ['I', 'K', ',', '8'],
  'right-ring': ['O', 'L', '.', '9'],
  'right-pinky': ['P', ';', "'", '/', '0', '-', '=', '[', ']', '\\'],
}

// 兼容旧API: 手指到字母的映射
export const FINGER_TO_LETTERS: Record<Finger, string[]> = {
  'left-pinky': ['Q', 'A', 'Z'],
  'left-ring': ['W', 'S', 'X'],
  'left-middle': ['E', 'D', 'C'],
  'left-index': ['R', 'F', 'V', 'T', 'G', 'B'],
  'right-index': ['Y', 'H', 'N', 'U', 'J', 'M'],
  'right-middle': ['I', 'K'],
  'right-ring': ['O', 'L'],
  'right-pinky': ['P'],
}

// 所有字母
export const ALL_LETTERS = 'QWERTYUIOPASDFGHJKLZXCVBNM'.split('')

// 所有数字
export const ALL_NUMBERS = '0123456789'.split('')

// 所有符号（不含Shift符号）
export const ALL_SYMBOLS = ["`", "-", "=", "[", "]", "\\", ";", "'", ",", ".", "/"]

// 第1个月字符：字母
export const MONTH1_CHARS = ALL_LETTERS

// 第2个月字符：字母 + 数字
export const MONTH2_CHARS = [...ALL_LETTERS, ...ALL_NUMBERS]

// 第3个月字符：字母 + 数字 + 符号
export const MONTH3_CHARS = [...ALL_LETTERS, ...ALL_NUMBERS, ...ALL_SYMBOLS]

// 根据天数获取可用字符
export function getAvailableChars(day: number): string[] {
  if (day <= 30) return MONTH1_CHARS       // 第1个月：字母
  if (day <= 60) return MONTH2_CHARS       // 第2个月：+数字
  return MONTH3_CHARS                       // 第3个月：+符号
}

// 左手字母
export const LEFT_HAND_LETTERS = [
  ...FINGER_TO_LETTERS['left-pinky'],
  ...FINGER_TO_LETTERS['left-ring'],
  ...FINGER_TO_LETTERS['left-middle'],
  ...FINGER_TO_LETTERS['left-index'],
]

// 右手字母
export const RIGHT_HAND_LETTERS = [
  ...FINGER_TO_LETTERS['right-index'],
  ...FINGER_TO_LETTERS['right-middle'],
  ...FINGER_TO_LETTERS['right-ring'],
  ...FINGER_TO_LETTERS['right-pinky'],
]

// 键盘行布局（完整版含数字和符号）
export const KEYBOARD_ROWS = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'"],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/'],
]

// Mac 键盘完整布局（含功能键）
export interface KeyConfig {
  key: string       // 键的标识
  label: string     // 显示的标签
  width: number     // 宽度（以普通键为1单位）
  isFunction?: boolean  // 是否为功能键
}

export const MAC_KEYBOARD_ROWS: KeyConfig[][] = [
  // 第1行：数字行
  [
    { key: '`', label: '`', width: 1 },
    { key: '1', label: '1', width: 1 },
    { key: '2', label: '2', width: 1 },
    { key: '3', label: '3', width: 1 },
    { key: '4', label: '4', width: 1 },
    { key: '5', label: '5', width: 1 },
    { key: '6', label: '6', width: 1 },
    { key: '7', label: '7', width: 1 },
    { key: '8', label: '8', width: 1 },
    { key: '9', label: '9', width: 1 },
    { key: '0', label: '0', width: 1 },
    { key: '-', label: '-', width: 1 },
    { key: '=', label: '=', width: 1 },
    { key: 'delete', label: '⌫', width: 1.5, isFunction: true },
  ],
  // 第2行：Tab行
  [
    { key: 'tab', label: '⇥', width: 1.5, isFunction: true },
    { key: 'Q', label: 'Q', width: 1 },
    { key: 'W', label: 'W', width: 1 },
    { key: 'E', label: 'E', width: 1 },
    { key: 'R', label: 'R', width: 1 },
    { key: 'T', label: 'T', width: 1 },
    { key: 'Y', label: 'Y', width: 1 },
    { key: 'U', label: 'U', width: 1 },
    { key: 'I', label: 'I', width: 1 },
    { key: 'O', label: 'O', width: 1 },
    { key: 'P', label: 'P', width: 1 },
    { key: '[', label: '[', width: 1 },
    { key: ']', label: ']', width: 1 },
    { key: '\\', label: '\\', width: 1 },
  ],
  // 第3行：Caps行
  [
    { key: 'caps', label: '⇪', width: 1.8, isFunction: true },
    { key: 'A', label: 'A', width: 1 },
    { key: 'S', label: 'S', width: 1 },
    { key: 'D', label: 'D', width: 1 },
    { key: 'F', label: 'F', width: 1 },
    { key: 'G', label: 'G', width: 1 },
    { key: 'H', label: 'H', width: 1 },
    { key: 'J', label: 'J', width: 1 },
    { key: 'K', label: 'K', width: 1 },
    { key: 'L', label: 'L', width: 1 },
    { key: ';', label: ';', width: 1 },
    { key: "'", label: "'", width: 1 },
    { key: 'return', label: '⏎', width: 1.7, isFunction: true },
  ],
  // 第4行：Shift行
  [
    { key: 'shift-left', label: '⇧', width: 2.3, isFunction: true },
    { key: 'Z', label: 'Z', width: 1 },
    { key: 'X', label: 'X', width: 1 },
    { key: 'C', label: 'C', width: 1 },
    { key: 'V', label: 'V', width: 1 },
    { key: 'B', label: 'B', width: 1 },
    { key: 'N', label: 'N', width: 1 },
    { key: 'M', label: 'M', width: 1 },
    { key: ',', label: ',', width: 1 },
    { key: '.', label: '.', width: 1 },
    { key: '/', label: '/', width: 1 },
    { key: 'shift-right', label: '⇧', width: 2.2, isFunction: true },
  ],
  // 第5行：空格行
  [
    { key: 'fn', label: 'fn', width: 1, isFunction: true },
    { key: 'control', label: '⌃', width: 1, isFunction: true },
    { key: 'option-left', label: '⌥', width: 1, isFunction: true },
    { key: 'command-left', label: '⌘', width: 1.3, isFunction: true },
    { key: 'space', label: '', width: 5.4, isFunction: true },
    { key: 'command-right', label: '⌘', width: 1.3, isFunction: true },
    { key: 'option-right', label: '⌥', width: 1, isFunction: true },
  ],
]

// 功能键列表（用于判断是否为功能键）
export const FUNCTION_KEYS = [
  'delete', 'tab', 'caps', 'return', 
  'shift-left', 'shift-right',
  'fn', 'control', 'option-left', 'option-right',
  'command-left', 'command-right', 'space'
]

// 判断是否为功能键
export function isFunctionKey(key: string): boolean {
  return FUNCTION_KEYS.includes(key.toLowerCase())
}

// 仅字母的键盘行布局
export const KEYBOARD_LETTER_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
]

// 基准键位 (Home Row)
export const HOME_KEYS = {
  left: ['A', 'S', 'D', 'F'],
  right: ['J', 'K', 'L', ';'],
}

// 获取字符对应的手指
export function getFingerForChar(char: string): Finger | null {
  return CHAR_TO_FINGER[char.toUpperCase()] || CHAR_TO_FINGER[char] || null
}

// 兼容旧API
export function getFingerForLetter(letter: string): Finger | null {
  return getFingerForChar(letter)
}

// 获取手指对应的字符
export function getCharsForFinger(finger: Finger): string[] {
  return FINGER_TO_CHARS[finger] || []
}

// 兼容旧API
export function getLettersForFinger(finger: Finger): string[] {
  return FINGER_TO_LETTERS[finger] || []
}

// 判断是否为左手字母
export function isLeftHandLetter(letter: string): boolean {
  return LEFT_HAND_LETTERS.includes(letter.toUpperCase())
}

// 判断是否为右手字母
export function isRightHandLetter(letter: string): boolean {
  return RIGHT_HAND_LETTERS.includes(letter.toUpperCase())
}
