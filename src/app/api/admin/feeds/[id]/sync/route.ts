import { NextRequest, NextResponse } from "next/server"
import { withAdmin, apiSuccess, apiError } from "@/src/lib/api-auth"
import { FeedAggregatorService } from "@/src/lib/rss/FeedAggregatorService"

interface Context {
  params: {
    id: string
  }
}

/**
 * POST /api/admin/feeds/[id]/sync - Sincroniza um feed específico
 */
export const POST = withAdmin(async (request: NextRequest, { params }: Context) => {
  try {
    const feedId = BigInt(params.id)
    const aggregator = new FeedAggregatorService()

    console.log(`Iniciando sincronização manual do feed ${feedId}`)

    const addedArticles = await aggregator.syncFeed(feedId)

    return apiSuccess({
      feedId: feedId.toString(),
      addedArticles,
      syncedAt: new Date().toISOString()
    }, `Sincronização concluída. ${addedArticles} novos artigos adicionados.`)

  } catch (error: any) {
    console.error(`Erro ao sincronizar feed ${params.id}:`, error)
    
    // Erros específicos do feed (URL inválida, timeout, etc.)
    if (error.message.includes("Invalid URL") || error.message.includes("ENOTFOUND")) {
      return apiError("URL do feed inválida ou inacessível", 400, error)
    }
    
    if (error.message.includes("timeout")) {
      return apiError("Timeout ao acessar o feed. Tente novamente.", 408, error)
    }
    
    return apiError("Erro ao sincronizar feed", 500, error)
  }
})
