import { NextRequest, NextResponse } from "next/server"
// import { cleanRepository } from "@/src/jobs/cleanRepository" // DESABILITADO
import { apiSuccess, apiError } from "@/src/lib/api-auth"

/**
 * POST /api/cron/clean - Endpoint para cron externo (DESABILITADO)
 * 
 * NOTA: Sistema configurado como REPOSITÓRIO DE CONSULTA
 * - Artigos antigos são preservados para consulta histórica
 * - Não há limpeza automática de conteúdo
 * - Foco em preservar o acervo científico
 */
export async function POST(request: NextRequest) {
  try {
    // Verificação básica de segurança (opcional)
    const cronSecret = request.headers.get("x-cron-secret")
    if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
      return apiError("Acesso negado", 401)
    }

    console.log("🧹 Endpoint de limpeza chamado (DESABILITADO - Sistema de consulta)")

    // Retorna informação sobre o sistema de consulta
    return apiSuccess({
      status: "disabled",
      reason: "Sistema configurado como repositório de consulta",
      message: "Artigos antigos são preservados para consulta histórica",
      executedAt: new Date().toISOString(),
      source: "external-cron",
      recommendation: "Use /api/cron/sync para sincronização de feeds"
    }, `Sistema de limpeza desabilitado - Foco em preservar o acervo científico`)

  } catch (error: any) {
    console.error("❌ Erro no endpoint de limpeza:", error)
    return apiError("Erro no endpoint de limpeza", 500)
  }
}
