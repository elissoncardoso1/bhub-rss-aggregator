import { NextRequest, NextResponse } from "next/server"
import { withAdmin, apiSuccess, apiError } from "@/src/lib/api-auth"
import { FeedAggregatorService } from "@/src/lib/rss/FeedAggregatorService"

/**
 * POST /api/admin/feeds/test - Testa um feed RSS/Atom
 */
export const POST = withAdmin(async (request: NextRequest) => {
  try {
    const { feedUrl } = await request.json()

    if (!feedUrl) {
      return apiError("URL do feed é obrigatória", 400)
    }

    console.log(`Testando feed: ${feedUrl}`)

    const aggregator = new FeedAggregatorService()
    const result = await aggregator.testFeed(feedUrl)

    return apiSuccess(result, `Feed testado com sucesso. ${result.items_found} itens encontrados.`)

  } catch (error: any) {
    console.error("Erro ao testar feed:", error)
    
    // Erros específicos do feed
    if (error.message.includes("Invalid URL") || error.message.includes("ENOTFOUND")) {
      return apiError("URL do feed inválida ou inacessível", 400, error)
    }
    
    if (error.message.includes("timeout")) {
      return apiError("Timeout ao acessar o feed. Tente novamente.", 408, error)
    }
    
    return apiError("Erro ao testar feed", 500, error)
  }
})