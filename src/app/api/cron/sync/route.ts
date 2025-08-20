import { NextRequest, NextResponse } from "next/server"
import { syncAllFeeds } from "@/src/jobs/syncFeeds"
import { apiSuccess, apiError } from "@/src/lib/api-auth"

/**
 * POST /api/cron/sync - Endpoint para cron externo sincronizar feeds
 * Usado em ambientes serverless onde não é possível usar node-cron
 */
export async function POST(request: NextRequest) {
  try {
    // Verificação básica de segurança (opcional)
    const cronSecret = request.headers.get("x-cron-secret")
    if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
      return apiError("Acesso negado", 401)
    }

    console.log("🔄 Executando sincronização via cron externo")

    const result = await syncAllFeeds()

    return apiSuccess({
      totalArticles: result.total_articles,
      feedsProcessed: result.feeds_processed,
      errors: result.errors,
      executedAt: new Date().toISOString(),
      source: "external-cron"
    }, `Cron executado: ${result.total_articles} novos artigos de ${result.feeds_processed} feeds`)

  } catch (error: any) {
    console.error("❌ Erro no cron de sincronização:", error)
    return apiError("Erro no cron de sincronização", 500, error)
  }
}
