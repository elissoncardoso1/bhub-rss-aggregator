import { RateLimiterMemory } from 'rate-limiter-flexible'
import { NextRequest, NextResponse } from 'next/server'

// Configuração do rate limiter para sugestões de busca
const searchRateLimiter = new RateLimiterMemory({
  points: 10, // 10 tentativas
  duration: 60, // por minuto
  blockDuration: 60 * 5, // bloqueia por 5 minutos se exceder
})

// Configuração do rate limiter para APIs gerais
const apiRateLimiter = new RateLimiterMemory({
  points: 100, // 100 tentativas
  duration: 60, // por minuto
  blockDuration: 60 * 10, // bloqueia por 10 minutos se exceder
})

// Middleware para aplicar rate limiting
export async function applyRateLimit(
  req: NextRequest,
  limiter: RateLimiterMemory,
  identifier: string
): Promise<{ success: boolean; remainingPoints: number; resetTime: number }> {
  try {
    const result = await limiter.consume(identifier)
    return {
      success: true,
      remainingPoints: result.remainingPoints,
      resetTime: result.msBeforeNext,
    }
  } catch (rejRes: any) {
    return {
      success: false,
      remainingPoints: 0,
      resetTime: rejRes.msBeforeNext,
    }
  }
}

// Função para verificar rate limit em rotas específicas
export async function checkSearchRateLimit(req: NextRequest): Promise<NextResponse | null> {
  const identifier = `search:${req.ip || 'unknown'}`
  const result = await applyRateLimit(req, searchRateLimiter, identifier)
  
  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        message: 'Muitas tentativas. Tente novamente em alguns minutos.',
        resetTime: Math.ceil(result.resetTime / 1000), // em segundos
      },
      { status: 429 }
    )
  }
  
  return null
}

// Função para verificar rate limit em APIs gerais
export async function checkAPIRateLimit(req: NextRequest): Promise<NextResponse | null> {
  const identifier = `api:${req.ip || 'unknown'}`
  const result = await applyRateLimit(req, apiRateLimiter, identifier)
  
  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        message: 'Taxa de requisições excedida. Tente novamente em alguns minutos.',
        resetTime: Math.ceil(result.resetTime / 1000), // em segundos
      },
      { status: 429 }
    )
  }
  
  return null
}

// Headers de segurança para todas as respostas
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  return response
}
