// 手指类型
export type Finger = 
  | 'left-pinky'    // 左手小指
  | 'left-ring'     // 左手无名指
  | 'left-middle'   // 左手中指
  | 'left-index'    // 左手食指
  | 'right-index'   // 右手食指
  | 'right-middle'  // 右手中指
  | 'right-ring'    // 右手无名指
  | 'right-pinky'   // 右手小指

// 手指颜色映射
export const FINGER_COLORS: Record<Finger, string> = {
  'left-pinky': '#9B59B6',    // 紫色
  'left-ring': '#3498DB',     // 蓝色
  'left-middle': '#1ABC9C',   // 青色
  'left-index': '#2ECC71',    // 绿色
  'right-index': '#F1C40F',   // 黄色
  'right-middle': '#E67E22',  // 橙色
  'right-ring': '#E74C3C',    // 红色
  'right-pinky': '#FF69B4',   // 粉色
}

// 手指中文名称
export const FINGER_NAMES: Record<Finger, string> = {
  'left-pinky': '左手小指',
  'left-ring': '左手无名指',
  'left-middle': '左手中指',
  'left-index': '左手食指',
  'right-index': '右手食指',
  'right-middle': '右手中指',
  'right-ring': '右手无名指',
  'right-pinky': '右手小指',
}

// 字母统计
export interface LetterStat {
  totalAttempts: number
  correctAttempts: number
  totalResponseTime: number  // 累计反应时间(ms)
}

// 每日记录
export interface DailyRecord {
  day: number
  date: string              // YYYY-MM-DD
  totalChars: number
  correctChars: number
  totalTime: number         // 练习时长(ms)
  earnedPoints: number
  accuracy: number
  avgResponseTime: number
}

// 礼物
export interface Gift {
  id: string
  name: string
  points: number
  image?: string
  createdAt: string
}

// 已兑换礼物
export interface RedeemedGift {
  id: string
  giftId: string
  giftName: string
  points: number
  redeemedAt: string
  claimedAt?: string        // 领取时间
}

// 成就定义
export interface AchievementDef {
  id: string
  name: string
  description: string
  icon: string
  condition: (stats: UserStats) => boolean
}

// 已解锁成就
export interface UnlockedAchievement {
  id: string
  unlockedAt: string
}

// 用户统计（用于成就检测）
export interface UserStats {
  currentDay: number
  consecutiveDays: number
  totalChars: number
  overallAccuracy: number
  avgResponseTime: number
  todayAccuracy: number
  perfectDays: number
}

// 今日进度
export interface TodayProgress {
  date: string              // 当前练习的日期 YYYY-MM-DD
  startTime: number | null  // 今日开始时间戳
  totalTime: number         // 今日累计时间(ms)
  completed: boolean        // 今日是否完成
  totalChars: number        // 今日练习字符数
  correctChars: number      // 今日正确字符数
}

// 用户数据（持久化）
export interface UserData {
  currentDay: number                          // 当前解锁的天数
  consecutiveDays: number                     // 连续打卡天数
  lastCompletedDate: string | null            // 最后完成日期
  todayProgress: TodayProgress
  totalPoints: number                         // 总积分
  usedPoints: number                          // 已使用积分
  gifts: Gift[]                               // 可兑换礼物列表
  redeemedGifts: RedeemedGift[]               // 已兑换礼物
  achievements: UnlockedAchievement[]         // 已获得成就
  letterStats: Record<string, LetterStat>     // 每个字母的统计
  dailyRecords: DailyRecord[]                 // 每日记录
  soundEnabled: boolean                       // 是否开启音效
}

// 练习阶段
export type Stage = 1 | 2 | 3 | 4

// 获取当前阶段
export function getStage(day: number): Stage {
  if (day <= 8) return 1       // 单指基础
  if (day <= 14) return 2      // 同手组合
  if (day <= 21) return 3      // 双手协作
  return 4                     // 综合强化
}

// 阶段名称
export const STAGE_NAMES: Record<Stage, string> = {
  1: '单指基础',
  2: '同手组合',
  3: '双手协作',
  4: '综合强化',
}

// 练习配置
export const EXERCISE_CONFIG = {
  dailyDuration: 30 * 60 * 1000,  // 每日练习时长 30分钟
  minDailyKeystrokes: 300,         // 每日最低按键次数
  restInterval: 5 * 60 * 1000,     // 休息提醒间隔 5分钟
  restDuration: 30 * 1000,         // 建议休息时长 30秒
  weakThreshold: 0.8,              // 弱项阈值（准确率低于80%）
  weakRatio: 0.3,                  // 弱项练习占比 30%
}

// 积分配置
export const POINTS_CONFIG = {
  baseDailyPoints: 100,
  accuracyBonus: {
    high: { threshold: 0.95, points: 50 },
    medium: { threshold: 0.9, points: 30 },
    low: { threshold: 0.8, points: 10 },
  },
  speedBonus: {
    fast: { threshold: 500, points: 30 },
    medium: { threshold: 800, points: 15 },
  },
  streakBonusPerDay: 10,
  maxStreakBonus: 100,
}

// 游戏时间追踪
export interface GameTimeTracking {
  date: string              // 当前游戏日期 YYYY-MM-DD
  startTime: number | null  // 今日开始游戏时间戳
  totalTime: number         // 今日累计游戏时间(ms)
  completed: boolean        // 今日是否用完30分钟
}

// 游戏状态
export interface GameState {
  isPlaying: boolean
  currentGame: string | null  // 当前游戏ID
  startTime: number | null    // 当前游戏开始时间
}

// 蛇身节点
export interface SnakeSegment {
  x: number
  y: number
  letter: string  // 该节段的字母
}

// 方向类型
export type Direction = 'up' | 'down' | 'left' | 'right'

// 贪吃蛇游戏配置
export interface SnakeGameConfig {
  gridSize: number        // 网格大小（像素）
  gridWidth: number       // 网格宽度（格子数）
  gridHeight: number      // 网格高度（格子数）
  initialLength: number   // 初始蛇长度
  moveSpeed: number       // 移动速度（毫秒）
  scorePerLetter: number  // 每个字母的分数
}

// 单词队列（用于单词库模式）
export interface WordQueue {
  words: string[]           // 单词库
  currentWordIndex: number  // 当前单词索引
  currentLetterIndex: number // 当前字母索引
}

// 贪吃蛇游戏状态
export interface SnakeGameState {
  snake: SnakeSegment[]   // 蛇身（头部在数组第一个）
  food: { x: number; y: number; letter: string } | null  // 食物位置和字母
  direction: Direction    // 当前移动方向
  nextDirection: Direction | null  // 下一个方向（用于防止立即反向）
  score: number           // 当前分数
  isGameOver: boolean    // 游戏是否结束
  isPaused: boolean       // 是否暂停
  wordQueue?: WordQueue   // 单词队列（单词库模式）
}

// 游戏模块配置
export const GAME_CONFIG = {
  dailyDuration: 30 * 60 * 1000,  // 每日游戏时长 30分钟
}

