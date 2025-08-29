import { initializeEmbeddings, isEmbeddingSystemReady } from '@/src/lib/ml'
import { logInfo, logWarn, logError } from '@/src/lib/logger'

/**
 * Inicializa sistemas críticos da aplicação
 */
export async function initializeApplication() {
  logInfo('🚀 Inicializando aplicação...')
  
  // Inicializa sistema de embeddings em background
  if (!isEmbeddingSystemReady()) {
    logInfo('🤖 Inicializando sistema de ML em background...')
    
    // Executa em background para não bloquear a inicialização
    initializeEmbeddings()
      .then(() => {
        logInfo('✅ Sistema de ML inicializado com sucesso')
      })
      .catch((error) => {
        logWarn('⚠️ Erro ao inicializar sistema de ML, continuando com fallback:', error)
      })
  } else {
    logInfo('✅ Sistema de ML já está pronto')
  }
  
  logInfo('🎯 Aplicação inicializada')
}

// Auto-inicialização quando o módulo é importado
if (typeof window === 'undefined') {
  // Apenas no servidor
  initializeApplication().catch((error) => {
    logError('💥 Erro crítico na inicialização da aplicação:', error)
  })
}