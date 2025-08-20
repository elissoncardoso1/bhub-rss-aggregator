import { NextRequest, NextResponse } from "next/server"
import { withAdmin, apiSuccess, apiError } from "@/src/lib/api-auth"
import { FeedAggregatorService } from "@/src/lib/rss/FeedAggregatorService"

/**
 * POST /api/admin/sync-all - Sincroniza todos os feeds ativos
 */
export const POST = withAdmin(async (request: NextRequest) => {
  try {
    console.log("Iniciando sincronização manual de todos os feeds")

    const aggregator = new FeedAggregatorService()
    const result = await aggregator.syncAllActiveFeeds()

    return apiSuccess({
      totalArticles: result.total_articles,
      feedsProcessed: result.feeds_processed,
      errors: result.errors,
      hasErrors: result.errors.length > 0,
      syncedAt: new Date().toISOString()
    }, `Sincronização concluída. ${result.total_articles} novos artigos de ${result.feeds_processed} feeds.`)

  } catch (error: any) {
    console.error("Erro na sincronização geral:", error)
    return apiError("Erro ao sincronizar feeds", 500, error)
  }
})
