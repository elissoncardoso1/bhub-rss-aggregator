import { embeddingManager, EmbeddingVector, CategoryEmbedding } from './setupEmbeddings'
import { logInfo, logError, logDebug, logWarn } from '@/src/lib/logger'
import { translationService } from './translationService'

// Interface para resultado da classificação
export interface ClassificationResult {
  category: string
  slug: string
  confidence: number
  alternativeCategories: Array<{
    category: string
    slug: string
    confidence: number
  }>
}

// Interface para resultado de similaridade
export interface SimilarityResult {
  category: string
  slug: string
  similarity: number
}

/**
 * Classe para classificação de artigos usando embeddings
 */
export class EmbeddingClassifier {
  private fallbackThreshold = 0.3 // Threshold mínimo para considerar uma categoria

  /**
   * Classifica um artigo baseado em título, abstract e keywords
   */
  async classifyArticle(
    title: string,
    abstract: string = '',
    keywords: string[] = []
  ): Promise<ClassificationResult | null> {
    try {
      // Verifica se o sistema está pronto
      if (!embeddingManager.isReady()) {
        logWarn('Sistema de embeddings não está pronto, usando fallback')
        return this.fallbackClassification(title, abstract, keywords)
      }

      // Combina o texto para análise
      const combinedText = await this.combineText(title, abstract, keywords)
      
      logDebug('Classificando artigo com embeddings', { 
        titleLength: title.length,
        abstractLength: abstract.length,
        keywordsCount: keywords.length,
        combinedLength: combinedText.length
      })

      // Gera embedding para o texto combinado
      const textEmbedding = await embeddingManager.generateEmbedding(combinedText)
      
      // Calcula similaridade com todas as categorias
      const similarities = this.calculateSimilarities(textEmbedding)
      
      // Ordena por similaridade (maior primeiro)
      similarities.sort((a, b) => b.similarity - a.similarity)
      
      // Verifica se a melhor categoria atende ao threshold
      if (similarities[0].similarity < this.fallbackThreshold) {
        logDebug('Nenhuma categoria atende ao threshold, usando fallback', {
          bestSimilarity: similarities[0].similarity,
          threshold: this.fallbackThreshold
        })
        return this.fallbackClassification(title, abstract, keywords)
      }

      // Prepara resultado principal
      const bestMatch = similarities[0]
      const alternativeCategories = similarities
        .slice(1, 4) // Top 3 alternativas
        .map(sim => ({
          category: sim.category,
          slug: sim.slug,
          confidence: sim.similarity
        }))

      const result: ClassificationResult = {
        category: bestMatch.category,
        slug: bestMatch.slug,
        confidence: bestMatch.similarity,
        alternativeCategories
      }

      logInfo('Artigo classificado com sucesso usando embeddings', {
        title: title.substring(0, 100),
        category: result.category,
        confidence: result.confidence,
        alternatives: alternativeCategories.length
      })

      return result

    } catch (error) {
      logError('Erro ao classificar artigo com embeddings', error as Error, {
        title: title.substring(0, 100)
      })
      
      // Fallback para classificação baseada em palavras-chave
      return this.fallbackClassification(title, abstract, keywords)
    }
  }

  /**
   * Calcula similaridade entre um embedding e todas as categorias
   */
  private calculateSimilarities(textEmbedding: EmbeddingVector): SimilarityResult[] {
    const categoryEmbeddings = embeddingManager.getCategoryEmbeddings()
    const similarities: SimilarityResult[] = []

    for (const categoryEmbedding of categoryEmbeddings) {
      const similarity = this.cosineSimilarity(textEmbedding, categoryEmbedding.centroid)
      
      similarities.push({
        category: categoryEmbedding.name,
        slug: categoryEmbedding.slug,
        similarity
      })
    }

    return similarities
  }

  /**
   * Calcula similaridade cosseno entre dois vetores
   */
  private cosineSimilarity(vec1: EmbeddingVector, vec2: EmbeddingVector): number {
    if (vec1.values.length !== vec2.values.length) {
      throw new Error('Vetores com dimensões diferentes')
    }

    let dotProduct = 0
    for (let i = 0; i < vec1.values.length; i++) {
      dotProduct += vec1.values[i] * vec2.values[i]
    }

    // Como os vetores já estão normalizados, a similaridade cosseno é o produto escalar
    return Math.max(0, dotProduct) // Garante que não seja negativo
  }

  /**
   * Combina título, abstract e keywords em um texto único
   */
  private async combineText(title: string, abstract: string, keywords: string[]): Promise<string> {
    const parts = [title]
    
    if (abstract) {
      try {
        // Traduzir resumo automaticamente para melhorar a classificação
        const translationResult = await translationService.translate(abstract)
        
        if (translationResult.isTranslated) {
          logDebug('Resumo traduzido automaticamente', {
            sourceLanguage: translationResult.sourceLanguage,
            fromCache: translationResult.fromCache,
            warning: translationResult.warning
          })
        }
        
        parts.push(translationResult.translatedText)
      } catch (error) {
        logWarn('Falha na tradução do resumo, usando texto original', {
          error: error instanceof Error ? error.message : error
        })
        parts.push(abstract)
      }
    }
    
    if (keywords.length > 0) {
      parts.push(keywords.join(' '))
    }
    
    return parts.join(' ').trim()
  }

  /**
   * Classificação fallback baseada em palavras-chave (método anterior)
   */
  private fallbackClassification(
    title: string,
    abstract: string = '',
    keywords: string[] = []
  ): ClassificationResult | null {
    const text = `${title} ${abstract}`.toLowerCase()
    const keywordText = keywords.join(" ").toLowerCase()
    const fullText = `${text} ${keywordText}`

    // Categorias e seus termos identificadores (mantido do sistema anterior)
    const categoryRules: Record<string, string[]> = {
      "Clínica": [
        "terapia", "therapy", "treatment", "intervention", "tratamento",
        "behavioral therapy", "cognitive", "psychotherapy", "psicoterapia",
        "clínica", "clinica", "patient", "disorder", "mental health"
      ],
      "Educação": [
        "education", "teaching", "school", "learning", "educação", "educacao",
        "student", "classroom", "academic", "pedagogical", "ensino", "aprendizagem"
      ],
      "Organizacional": [
        "organizational", "workplace", "management", "organizacional", "trabalho",
        "business", "corporate", "leadership", "team", "performance"
      ],
      "Pesquisa": [
        "experimental", "experiment", "research", "pesquisa", "metodologia",
        "analysis", "análise", "study", "estudo", "methodology"
      ],
      "Outros": [
        "análise do comportamento", "behavior analysis", "psicologia",
        "psychology", "comportamento", "behavior", "desenvolvimento"
      ]
    }

    let bestCategory: string | null = null
    let bestScore = 0

    for (const [categoryName, terms] of Object.entries(categoryRules)) {
      const matchCount = terms.filter(term => fullText.includes(term)).length
      
      if (matchCount > bestScore) {
        bestScore = matchCount
        bestCategory = categoryName
      }
    }

    if (!bestCategory || bestScore === 0) {
      return null
    }

    // Cria slug da categoria
    const slug = bestCategory
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")

    logInfo('Artigo classificado usando fallback', {
      title: title.substring(0, 100),
      category: bestCategory,
      method: 'keyword-based'
    })

    return {
      category: bestCategory,
      slug,
      confidence: bestScore / 10, // Normaliza o score
      alternativeCategories: []
    }
  }

  /**
   * Verifica se o sistema está pronto
   */
  isReady(): boolean {
    return embeddingManager.isReady()
  }

  /**
   * Retorna informações do sistema
   */
  getSystemInfo() {
    return {
      isReady: this.isReady(),
      fallbackThreshold: this.fallbackThreshold,
      embeddingInfo: embeddingManager.getModelInfo()
    }
  }
}

// Instância singleton
export const embeddingClassifier = new EmbeddingClassifier()

/**
 * Função de conveniência para classificar artigos
 */
export async function classifyArticle(
  title: string,
  abstract: string = '',
  keywords: string[] = []
): Promise<ClassificationResult | null> {
  return embeddingClassifier.classifyArticle(title, abstract, keywords)
}
