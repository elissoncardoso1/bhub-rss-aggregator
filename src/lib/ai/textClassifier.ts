import { HfInference } from '@huggingface/inference'
import { logInfo, logError, logDebug, logWarn } from '@/src/lib/logger'

// Configuração do cliente HuggingFace
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY)

// Modelos para diferentes tarefas
const MODELS = {
  // Classificação de texto em português
  textClassification: 'neuralmind/bert-base-portuguese-cased',
  // Análise de sentimento
  sentimentAnalysis: 'cardiffnlp/twitter-roberta-base-sentiment-latest',
  // Extração de palavras-chave
  keywordExtraction: 'ml6team/keyphrase-extraction-kbir-inspec',
  // Classificação de tópicos
  topicClassification: 'facebook/bart-large-mnli'
} as const

// Interface para classificação de texto
interface TextClassificationResult {
  label: string
  score: number
}

// Interface para análise de sentimento
interface SentimentResult {
  label: 'positive' | 'negative' | 'neutral'
  score: number
}

// Interface para extração de palavras-chave
interface KeywordResult {
  word: string
  score: number
}

// Classe principal para classificação de textos
export class TextClassifier {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.HUGGINGFACE_API_KEY || ''
    if (!this.apiKey) {
      logWarn('HuggingFace API key não configurada')
    }
  }

  // Classifica o título de um artigo em categorias predefinidas
  async classifyArticleTitle(title: string): Promise<TextClassificationResult[]> {
    try {
      if (!this.apiKey) {
        throw new Error('API key não configurada')
      }

      logDebug('Classificando título do artigo', { title: title.substring(0, 100) })

      const result = await hf.textClassification({
        model: MODELS.textClassification,
        inputs: title,
        parameters: {
          candidate_labels: [
            'análise do comportamento',
            'psicologia clínica',
            'neurociência',
            'educação especial',
            'terapia comportamental',
            'pesquisa experimental',
            'intervenção precoce',
            'autismo',
            'desenvolvimento infantil',
            'comportamento humano'
          ]
        }
      })

      logInfo('Título classificado com sucesso', { 
        title: title.substring(0, 100),
        topLabel: result[0]?.label,
        confidence: result[0]?.score
      })

      return result.map(item => ({
        label: item.label,
        score: item.score
      }))
    } catch (error) {
      logError('Erro ao classificar título do artigo', error as Error, { title: title.substring(0, 100) })
      throw error
    }
  }

  // Analisa o sentimento do abstract de um artigo
  async analyzeSentiment(text: string): Promise<SentimentResult> {
    try {
      if (!this.apiKey) {
        throw new Error('API key não configurada')
      }

      logDebug('Analisando sentimento do texto', { textLength: text.length })

      const result = await hf.textClassification({
        model: MODELS.sentimentAnalysis,
        inputs: text.substring(0, 500) // Limita o tamanho para evitar custos
      })

      const topResult = result[0]
      const label = this.mapSentimentLabel(topResult.label)

      logInfo('Sentimento analisado com sucesso', { 
        textLength: text.length,
        sentiment: label,
        confidence: topResult.score
      })

      return {
        label,
        score: topResult.score
      }
    } catch (error) {
      logError('Erro ao analisar sentimento', error as Error, { textLength: text.length })
      throw error
    }
  }

  // Extrai palavras-chave relevantes do texto
  async extractKeywords(text: string): Promise<KeywordResult[]> {
    try {
      if (!this.apiKey) {
        throw new Error('API key não configurada')
      }

      logDebug('Extraindo palavras-chave', { textLength: text.length })

      const result = await hf.tokenClassification({
        model: MODELS.keywordExtraction,
        inputs: text.substring(0, 300) // Limita o tamanho
      })

      const keywords = result
        .filter(token => token.score > 0.5) // Filtra por confiança
        .map(token => ({
          word: token.word,
          score: token.score
        }))
        .slice(0, 10) // Limita a 10 palavras-chave

      logInfo('Palavras-chave extraídas com sucesso', { 
        textLength: text.length,
        keywordCount: keywords.length
      })

      return keywords
    } catch (error) {
      logError('Erro ao extrair palavras-chave', error as Error, { textLength: text.length })
      throw error
    }
  }

  // Classifica o tópico principal do artigo
  async classifyTopic(text: string, candidateTopics: string[]): Promise<TextClassificationResult[]> {
    try {
      if (!this.apiKey) {
        throw new Error('API key não configurada')
      }

      logDebug('Classificando tópico do artigo', { 
        textLength: text.length,
        candidateTopics 
      })

      const result = await hf.textClassification({
        model: MODELS.topicClassification,
        inputs: text.substring(0, 500),
        parameters: {
          candidate_labels: candidateTopics
        }
      })

      logInfo('Tópico classificado com sucesso', { 
        textLength: text.length,
        topTopic: result[0]?.label,
        confidence: result[0]?.score
      })

      return result.map(item => ({
        label: item.label,
        score: item.score
      }))
    } catch (error) {
      logError('Erro ao classificar tópico', error as Error, { textLength: text.length })
      throw error
    }
  }

  // Mapeia labels de sentimento para valores padronizados
  private mapSentimentLabel(label: string): 'positive' | 'negative' | 'neutral' {
    const positiveLabels = ['positive', 'pos', 'good', 'excellent']
    const negativeLabels = ['negative', 'neg', 'bad', 'terrible']
    
    if (positiveLabels.some(l => label.toLowerCase().includes(l))) {
      return 'positive'
    }
    if (negativeLabels.some(l => label.toLowerCase().includes(l))) {
      return 'negative'
    }
    return 'neutral'
  }

  // Verifica se o serviço está disponível
  async isAvailable(): Promise<boolean> {
    try {
      return !!this.apiKey
    } catch {
      return false
    }
  }
}

// Instância singleton
export const textClassifier = new TextClassifier()
