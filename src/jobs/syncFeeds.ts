import { FeedAggregatorService } from "@/src/lib/rss/FeedAggregatorService"
import { initializeEmbeddings, isEmbeddingSystemReady } from "@/src/lib/ml"

/**
 * Job para sincronizar todos os feeds ativos
 */
export async function syncAllFeeds() {
  console.log("🔄 Iniciando sincronização de feeds...")
  
  // Inicializa o sistema de ML se ainda não estiver pronto
  if (!isEmbeddingSystemReady()) {
    console.log("🤖 Inicializando sistema de ML...")
    try {
      await initializeEmbeddings()
      console.log("✅ Sistema de ML inicializado com sucesso")
    } catch (error) {
      console.warn("⚠️ Erro ao inicializar sistema de ML, continuando com fallback:", error)
    }
  }
  
  const aggregator = new FeedAggregatorService()
  
  try {
    const result = await aggregator.syncAllActiveFeeds()
    
    console.log("✅ Sincronização concluída:", {
      totalArticles: result.total_articles,
      feedsProcessed: result.feeds_processed,
      errors: result.errors.length
    })
    
    if (result.errors.length > 0) {
      console.error("❌ Erros durante sincronização:")
      result.errors.forEach(error => console.error("  -", error))
    }
    
    return result
  } catch (error) {
    console.error("💥 Erro fatal na sincronização:", error)
    throw error
  }
}
