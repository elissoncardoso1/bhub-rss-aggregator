/**
 * Configurações do sistema de ML
 */

export const ML_CONFIG = {
  // Modelo de embeddings
  MODEL: {
    name: 'sentence-transformers/paraphrase-multilingual-mpnet-base-v2',
    quantized: false, // Usa modelo completo para melhor qualidade
    pooling: 'mean' as const,
    normalize: true
  },

  // Configurações de classificação
  CLASSIFICATION: {
    fallbackThreshold: 0.3, // Threshold mínimo para considerar uma categoria
    maxAlternatives: 3, // Número máximo de categorias alternativas
    minConfidence: 0.1 // Confiança mínima para qualquer categoria
  },

  // Configurações de cache
  CACHE: {
    enableLocalCache: true, // Habilita cache local de modelos
    maxCacheSize: '500MB', // Tamanho máximo do cache
    cacheExpiry: 24 * 60 * 60 * 1000 // 24 horas em ms
  },

  // Configurações de performance
  PERFORMANCE: {
    batchSize: 1, // Processa um artigo por vez
    maxTextLength: 1000, // Comprimento máximo do texto para análise
    timeout: 30000 // Timeout em ms para operações de ML
  },

  // Configurações de ambiente
  ENVIRONMENT: {
    allowRemoteModels: false, // Por padrão, não permite modelos remotos
    allowLocalModels: true, // Sempre permite modelos locais
    debugMode: process.env.NODE_ENV === 'development'
  },

  // Configurações de tradução automática
  TRANSLATION: {
    enabled: true,
    targetLanguage: 'en', // Inglês como idioma alvo para melhor classificação
    cacheEnabled: true,
    cacheExpiryHours: 24,
    maxCacheSize: 1000,
    warning: 'Tradução automática - pode conter erros'
    // AVISO: As traduções são feitas automaticamente usando heurísticas
    // e podem não ser 100% precisas. O sistema prioriza performance.
  }
} as const

/**
 * Tipos para as configurações
 */
export type ModelConfig = typeof ML_CONFIG.MODEL
export type ClassificationConfig = typeof ML_CONFIG.CLASSIFICATION
export type CacheConfig = typeof ML_CONFIG.CACHE
export type PerformanceConfig = typeof ML_CONFIG.PERFORMANCE
export type EnvironmentConfig = typeof ML_CONFIG.ENVIRONMENT
