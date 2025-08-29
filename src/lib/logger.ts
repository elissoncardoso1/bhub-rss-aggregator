import winston from 'winston'

// 🔴 Função para sanitizar dados sensíveis dos logs
function sanitizeLogData(meta: any): any {
  if (!meta || typeof meta !== 'object') return meta
  
  const sensitiveFields = [
    'password', 'token', 'apiKey', 'secret', 'key', 
    'authorization', 'cookie', 'session', 'auth',
    'email', 'phone', 'cpf', 'cnpj', 'credit_card'
  ]
  
  const sanitized = { ...meta }
  
  // Recursivamente sanitizar objetos aninhados
  function sanitizeObject(obj: any): any {
    if (obj === null || typeof obj !== 'object') return obj
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject)
    }
    
    const result: any = {}
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase()
      const isSensitive = sensitiveFields.some(field => lowerKey.includes(field))
      
      if (isSensitive && value) {
        result[key] = '[REDACTED]'
      } else if (typeof value === 'object') {
        result[key] = sanitizeObject(value)
      } else {
        result[key] = value
      }
    }
    
    return result
  }
  
  return sanitizeObject(sanitized)
}

// Formato personalizado para logs com sanitização
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    // 🔴 Sanitizar dados sensíveis antes de logar
    const sanitizedMeta = sanitizeLogData(meta)
    return `${timestamp} [${level.toUpperCase()}]: ${message} ${
      Object.keys(sanitizedMeta).length ? JSON.stringify(sanitizedMeta, null, 2) : ''
    }`
  })
)

// Configuração do logger
const logger = winston.createLogger({
  // 🔴 Nível de log mais restritivo em produção
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'bhub-api' },
  transports: [
    // Console em desenvolvimento
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    
    // Arquivo de logs em produção
    ...(process.env.NODE_ENV === 'production' ? [
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        // 🔴 Adicionar rotação de logs
        tailable: true,
        zippedArchive: true
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        tailable: true,
        zippedArchive: true
      })
    ] : [])
  ],
  
  // 🔴 Configurações de segurança para produção
  ...(process.env.NODE_ENV === 'production' && {
    exitOnError: false,
    handleExceptions: true,
    handleRejections: true
  })
})

// Logger para desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }))
}

// 🔴 Funções de conveniência com sanitização automática
export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta)
}

export const logError = (message: string, error?: Error, meta?: any) => {
  // 🔴 Sanitizar stack trace em produção
  const safeError = process.env.NODE_ENV === 'production' 
    ? { message: error?.message, name: error?.name }
    : { message: error?.message, stack: error?.stack, name: error?.name }
  
  logger.error(message, { error: safeError, ...meta })
}

export const logWarn = (message: string, meta?: any) => {
  logger.warn(message, meta)
}

export const logDebug = (message: string, meta?: any) => {
  // 🔴 Não logar debug em produção
  if (process.env.NODE_ENV !== 'production') {
    logger.debug(message, meta)
  }
}

export default logger
