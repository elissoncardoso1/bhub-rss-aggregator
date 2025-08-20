import { NextRequest, NextResponse } from "next/server"
import { cleanRepository } from "@/src/jobs/cleanRepository"
import { apiSuccess, apiError } from "@/src/lib/api-auth"

/**
 * POST /api/cron/clean - Endpoint para cron externo limpar repositório
 * Usado em ambientes serverless onde não é possível usar node-cron
 */
export async function POST(request: NextRequest) {
  try {
    // Verificação básica de segurança (opcional)
    const cronSecret = request.headers.get("x-cron-secret")
    if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
      return apiError("Acesso negado", 401)
    }

    console.log("🧹 Executando limpeza via cron externo")

    const result = await cleanRepository(365) // Remove artigos com mais de 365 dias

    return apiSuccess({
      deletedArticles: result.deletedArticles,
      deletedAuthors: result.deletedAuthors,
      cutoffDate: 'cutoffDate' in result ? result.cutoffDate : undefined,
      executedAt: new Date().toISOString(),
      source: "external-cron"
    }, `Cron executado: ${result.deletedArticles} artigos e ${result.deletedAuthors} autores removidos`)

  } catch (error: any) {
    console.error("❌ Erro no cron de limpeza:", error)
    return apiError("Erro no cron de limpeza", 500, error)
  }
}
