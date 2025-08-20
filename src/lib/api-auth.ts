import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth"

/**
 * Verifica se o usuário está autenticado e tem role de admin
 */
export async function requireAdmin(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({
      success: false,
      message: "Acesso negado. Faça login para continuar."
    }, { status: 401 })
  }
  
  // @ts-ignore - session tem a propriedade role adicionada no callback
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({
      success: false,
      message: "Acesso negado. Apenas administradores podem acessar este recurso."
    }, { status: 403 })
  }
  
  return null // Sem erro, usuário autorizado
}

/**
 * Wrapper para rotas que requerem autenticação de admin
 */
export function withAdmin(handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>) {
  return async (request: NextRequest, ...args: any[]) => {
    const authError = await requireAdmin(request)
    if (authError) return authError
    
    return handler(request, ...args)
  }
}

/**
 * Resposta padrão de sucesso para API
 */
export function apiSuccess(data?: any, message?: string) {
  return NextResponse.json({
    success: true,
    message: message || "Operação realizada com sucesso",
    data
  })
}

/**
 * Resposta padrão de erro para API
 */
export function apiError(message: string, status: number = 400, error?: any) {
  return NextResponse.json({
    success: false,
    message,
    error: error?.message || error
  }, { status })
}
