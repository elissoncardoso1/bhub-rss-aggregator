// Exporta todas as funcionalidades de ML
export * from './setupEmbeddings'
export * from './embedClassifier'
export * from './config'

// Re-exporta as instâncias principais para facilitar o uso
export { embeddingManager } from './setupEmbeddings'
export { embeddingClassifier } from './embedClassifier'

// Funções de conveniência
export { initializeEmbeddings, isEmbeddingSystemReady } from './setupEmbeddings'
export { classifyArticle } from './embedClassifier'

// Configurações
export { ML_CONFIG } from './config'
