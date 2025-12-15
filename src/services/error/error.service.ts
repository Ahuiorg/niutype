import { ref, readonly } from 'vue'

export type ErrorSeverity = 'info' | 'warning' | 'error'

export interface AppError {
  id: string
  message: string
  severity: ErrorSeverity
  code?: string
  details?: string
  timestamp: number
  dismissed: boolean
}

const errors = ref<AppError[]>([])
let errorIdCounter = 0

function generateId(): string {
  return `err_${Date.now()}_${++errorIdCounter}`
}

function parseError(error: unknown): { message: string; code?: string; details?: string } {
  if (error instanceof Error) {
    // Supabase 错误
    const supabaseError = error as any
    if (supabaseError.code) {
      return {
        message: getErrorMessage(supabaseError.code, supabaseError.message),
        code: supabaseError.code,
        details: supabaseError.message,
      }
    }
    return { message: error.message }
  }

  if (typeof error === 'string') {
    return { message: error }
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return { message: String((error as any).message) }
  }

  return { message: '发生未知错误' }
}

function getErrorMessage(code: string, fallback: string): string {
  const messages: Record<string, string> = {
    // 认证相关
    'invalid_credentials': '账号或密码错误',
    'user_not_found': '用户不存在',
    'email_not_confirmed': '邮箱未验证',
    'invalid_grant': '登录凭证无效',
    'user_already_exists': '用户已存在',
    'weak_password': '密码强度不足',
    'over_request_rate_limit': '请求过于频繁，请稍后再试',

    // 网络相关
    'NETWORK_ERROR': '网络连接失败，请检查网络',
    'TIMEOUT': '请求超时，请稍后重试',

    // 数据相关
    'PGRST116': '数据不存在',
    '23505': '数据已存在',
    '23503': '关联数据不存在',
    '42501': '权限不足',

    // 自定义
    'NOT_AUTHENTICATED': '请先登录',
    'OFFLINE': '当前处于离线状态',
  }

  return messages[code] || fallback
}

export function reportError(
  error: unknown,
  severity: ErrorSeverity = 'error',
): AppError {
  const parsed = parseError(error)
  const appError: AppError = {
    id: generateId(),
    message: parsed.message,
    severity,
    code: parsed.code,
    details: parsed.details,
    timestamp: Date.now(),
    dismissed: false,
  }

  errors.value.push(appError)

  // 自动清理 info 和 warning
  if (severity !== 'error') {
    setTimeout(() => {
      dismissError(appError.id)
    }, 5000)
  }

  // 控制台日志
  if (import.meta.env.DEV) {
    console.error('[AppError]', appError)
  }

  return appError
}

export function dismissError(id: string) {
  const error = errors.value.find((e) => e.id === id)
  if (error) {
    error.dismissed = true
  }
  // 延迟移除以便动画
  setTimeout(() => {
    errors.value = errors.value.filter((e) => e.id !== id)
  }, 300)
}

export function clearAllErrors() {
  errors.value = []
}

export function useErrors() {
  return {
    errors: readonly(errors),
    reportError,
    dismissError,
    clearAllErrors,
  }
}

// 全局错误处理器（用于 Vue app.config.errorHandler）
export function setupGlobalErrorHandler(app: any) {
  app.config.errorHandler = (err: unknown, instance: any, info: string) => {
    reportError(err, 'error')
    if (import.meta.env.DEV) {
      console.error('Vue Error:', err, '\nInfo:', info)
    }
  }

  // 未捕获的 Promise 错误
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      reportError(event.reason, 'error')
      if (import.meta.env.DEV) {
        console.error('Unhandled Promise Rejection:', event.reason)
      }
    })
  }
}

// 网络错误处理
export function handleNetworkError(error: unknown): never {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    throw new Error('网络连接失败，请检查网络')
  }
  throw error
}

// 包装异步函数以自动报告错误
export function withErrorReporting<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  severity: ErrorSeverity = 'error',
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args)
    } catch (error) {
      reportError(error, severity)
      throw error
    }
  }) as T
}
