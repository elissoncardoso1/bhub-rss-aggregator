import { pipeline, env } from '@xenova/transformers'
import { logInfo, logError, logDebug } from '@/src/lib/logger'

// Configuração para permitir download inicial do modelo
env.allowLocalModels = true
env.allowRemoteModels = true

// Interface para embeddings
export interface EmbeddingVector {
  values: number[]
  magnitude: number
}

// Interface para categoria com embedding
export interface CategoryEmbedding {
  name: string
  slug: string
  centroid: EmbeddingVector
  examples: string[]
}

// Exemplos representativos por categoria
const CATEGORY_EXAMPLES: Record<string, string[]> = {
  'Clínica': [
    'terapia comportamental cognitiva',
    'psicologia clínica',
    'tratamento de transtornos',
    'intervenção psicológica',
    'psicoterapia',
    'diagnóstico psicológico',
    'saúde mental',
    'clínica psicológica',
    'terapia individual',
    'avaliação clínica'
  ],
  'Educação': [
    'educação especial',
    'ensino de crianças',
    'aprendizagem escolar',
    'pedagogia',
    'educação inclusiva',
    'métodos de ensino',
    'desenvolvimento educacional',
    'formação de professores',
    'tecnologia educacional',
    'currículo escolar'
  ],
  'Organizacional': [
    'psicologia organizacional',
    'comportamento no trabalho',
    'gestão de equipes',
    'liderança empresarial',
    'desenvolvimento organizacional',
    'clima organizacional',
    'recursos humanos',
    'treinamento corporativo',
    'análise comportamental aplicada',
    'consultoria organizacional'
  ],
  'Pesquisa': [
    'pesquisa experimental',
    'metodologia científica',
    'análise de dados',
    'estudos longitudinais',
    'revisão sistemática',
    'meta-análise',
    'validação de instrumentos',
    'estudos de caso',
    'pesquisa qualitativa',
    'estatística aplicada'
  ],
  'Outros': [
    'análise do comportamento',
    'psicologia experimental',
    'neurociência comportamental',
    'desenvolvimento humano',
    'comportamento animal',
    'psicologia social',
    'psicologia do desenvolvimento',
    'psicologia cognitiva',
    'psicologia evolutiva',
    'psicologia comparada'
  ]
}

// Cache global para embeddings das categorias
let categoryEmbeddingsCache: CategoryEmbedding[] | null = null
let isInitialized = false

/**
 * Classe para gerenciar embeddings das categorias
 */
export class EmbeddingManager {
  private model: any = null
  private modelName = 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2'

  /**
   * Inicializa o modelo de embeddings
   */
  async initialize(): Promise<void> {
    if (isInitialized) {
      logDebug('Modelo de embeddings já inicializado')
      return
    }

    try {
      logInfo('Inicializando modelo de embeddings...', { model: this.modelName })
      
      // Primeiro tenta carregar localmente
      try {
        env.allowRemoteModels = false
        this.model = await pipeline('feature-extraction', this.modelName, {
          quantized: false,
          progress_callback: (progress: any) => {
            if (progress.status === 'ready') {
              logInfo('Modelo de embeddings carregado localmente com sucesso')
            }
          }
        })
        logInfo('Modelo carregado do cache local')
      } catch (localError) {
        logInfo('Modelo não encontrado localmente, fazendo download...')
        
        // Se falhar localmente, permite download
        env.allowRemoteModels = true
        this.model = await pipeline('feature-extraction', this.modelName, {
          quantized: false,
          progress_callback: (progress: any) => {
            if (progress.status === 'ready') {
              logInfo('Modelo de embeddings baixado e carregado com sucesso')
            }
          }
        })
        
        // Após download, volta para modo offline
        env.allowRemoteModels = false
        logInfo('Modelo baixado, sistema configurado para modo offline')
      }

      // Calcula embeddings das categorias
      await this.calculateCategoryEmbeddings()
      
      isInitialized = true
      logInfo('Sistema de embeddings inicializado com sucesso')
      
    } catch (error) {
      logError('Erro ao inicializar modelo de embeddings', error as Error)
      throw error
    }
  }

  /**
   * Calcula embeddings para todas as categorias
   */
  private async calculateCategoryEmbeddings(): Promise<void> {
    if (!this.model) {
      throw new Error('Modelo não inicializado')
    }

    logInfo('Calculando embeddings das categorias...')
    
    const embeddings: CategoryEmbedding[] = []

    for (const [categoryName, examples] of Object.entries(CATEGORY_EXAMPLES)) {
      try {
        logDebug(`Processando categoria: ${categoryName}`)
        
        // Gera embeddings para todos os exemplos da categoria
        const exampleEmbeddings: EmbeddingVector[] = []
        
        for (const example of examples) {
          const embedding = await this.generateEmbedding(example)
          exampleEmbeddings.push(embedding)
        }

        // Calcula o centroide (vetor médio) da categoria
        const centroid = this.calculateCentroid(exampleEmbeddings)
        
        // Cria slug da categoria
        const slug = categoryName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, '-')

        embeddings.push({
          name: categoryName,
          slug,
          centroid,
          examples
        })

        logDebug(`Categoria ${categoryName} processada com sucesso`)
        
      } catch (error) {
        logError(`Erro ao processar categoria ${categoryName}`, error as Error)
      }
    }

    categoryEmbeddingsCache = embeddings
    logInfo(`Embeddings calculados para ${embeddings.length} categorias`)
  }

  /**
   * Gera embedding para um texto
   */
  async generateEmbedding(text: string): Promise<EmbeddingVector> {
    if (!this.model) {
      throw new Error('Modelo não inicializado')
    }

    try {
      const output = await this.model(text, {
        pooling: 'mean',
        normalize: true
      })

      const values = Array.from(output.data) as number[]
      const magnitude = Math.sqrt(values.reduce((sum, val) => sum + val * val, 0))

      return { values, magnitude }
    } catch (error) {
      logError('Erro ao gerar embedding', error as Error, { text: text.substring(0, 100) })
      throw error
    }
  }

  /**
   * Calcula o centroide (vetor médio) de uma lista de embeddings
   */
  private calculateCentroid(embeddings: EmbeddingVector[]): EmbeddingVector {
    if (embeddings.length === 0) {
      throw new Error('Lista de embeddings vazia')
    }

    const dimension = embeddings[0].values.length
    const centroidValues = new Array(dimension).fill(0)

    // Soma todos os valores
    for (const embedding of embeddings) {
      for (let i = 0; i < dimension; i++) {
        centroidValues[i] += embedding.values[i]
      }
    }

    // Calcula a média
    for (let i = 0; i < dimension; i++) {
      centroidValues[i] /= embeddings.length
    }

    // Normaliza o centroide
    const magnitude = Math.sqrt(centroidValues.reduce((sum, val) => sum + val * val, 0))
    for (let i = 0; i < dimension; i++) {
      centroidValues[i] /= magnitude
    }

    return {
      values: centroidValues,
      magnitude: 1.0 // Normalizado
    }
  }

  /**
   * Retorna os embeddings das categorias
   */
  getCategoryEmbeddings(): CategoryEmbedding[] {
    if (!categoryEmbeddingsCache) {
      throw new Error('Embeddings das categorias não foram calculados')
    }
    return categoryEmbeddingsCache
  }

  /**
   * Verifica se o sistema está inicializado
   */
  isReady(): boolean {
    return isInitialized && categoryEmbeddingsCache !== null
  }

  /**
   * Retorna informações do modelo
   */
  getModelInfo() {
    return {
      name: this.modelName,
      isInitialized: isInitialized,
      categoriesCount: categoryEmbeddingsCache?.length || 0
    }
  }
}

// Instância singleton
export const embeddingManager = new EmbeddingManager()

/**
 * Função para inicializar o sistema de embeddings
 */
export async function initializeEmbeddings(): Promise<void> {
  try {
    await embeddingManager.initialize()
  } catch (error) {
    logError('Falha ao inicializar sistema de embeddings', error as Error)
    throw error
  }
}

/**
 * Função para verificar se o sistema está pronto
 */
export function isEmbeddingSystemReady(): boolean {
  return embeddingManager.isReady()
}
