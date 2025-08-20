import { NextRequest, NextResponse } from "next/server"
import { withAdmin, apiSuccess, apiError } from "@/src/lib/api-auth"
import { FeedAggregatorService } from "@/src/lib/rss/FeedAggregatorService"

/**
 * POST /api/admin/feeds/verify - Verifica a conectividade de todos os feeds
 */
export const POST = withAdmin(async (request: NextRequest) => {
  try {
    console.log("Iniciando verificação de conectividade de todos os feeds")

    const aggregator = new FeedAggregatorService()
    const result = await aggregator.testAllFeeds()

    return apiSuccess({
      workingFeeds: result.working.length,
      brokenFeeds: result.broken.length,
      totalFeeds: result.working.length + result.broken.length,
      working: result.working,
      broken: result.broken,
      verifiedAt: new Date().toISOString()
    }, `Verificação concluída. ${result.working.length} feeds funcionando, ${result.broken.length} com problemas.`)

  } catch (error: any) {
    console.error("Erro na verificação de feeds:", error)
    return apiError("Erro ao verificar feeds", 500, error)
  }
})
