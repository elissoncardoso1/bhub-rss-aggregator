// TRADUÇÃO POR IA LOCAL DESABILITADA
// Descomente as linhas abaixo e instale as dependências quando implementar tradução por IA
// import { pipeline, Pipeline, TranslationPipeline } from '@xenova/transformers';

export interface AITranslationResult {
  translatedText: string;
  confidence: number;
  provider: 'ai-local';
  fromCache: boolean;
  modelUsed: string;
  processingTime: number;
}

export interface AITranslationOptions {
  sourceLanguage?: string;
  targetLanguage: string;
  maxLength?: number;
  useCache?: boolean;
}

/**
 * Serviço de tradução usando modelos de IA locais via @xenova/transformers
 * Suporta múltiplos modelos: NLLB-200, MarianMT, M2M100
 * 
 * ATENÇÃO: Esta funcionalidade está DESABILITADA
 * Para habilitar, instale as dependências @xenova/transformers e onnxruntime-node
 * e descomente o código relacionado
 */
export class AITranslationService {
  private static readonly DEFAULT_MODEL = 'Xenova/nllb-200-distilled-600M';
  // private translator: TranslationPipeline | null = null;
  private modelName: string;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;
  private cache = new Map<string, AITranslationResult>();
  private maxCacheSize = 1000;

  constructor(modelName = 'Xenova/nllb-200-distilled-600M') {
    this.modelName = modelName;
  }

  /**
   * Inicializa o serviço de tradução carregando o modelo
   */
  async initialize(): Promise<void> {
    // FUNCIONALIDADE DESABILITADA
    throw new Error('Tradução por IA local está desabilitada. Para habilitar, instale @xenova/transformers e onnxruntime-node');
    
    /*
    if (this.isInitialized) {
      return;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._initializeModel();
    await this.initializationPromise;
    */
  }

  /**
   * Inicializa o modelo de tradução
   * DESABILITADO - Para habilitar, descomente e instale dependências
   */
  private async _initializeModel(): Promise<void> {
    throw new Error('Tradução por IA local está desabilitada');
    
    /*
    try {
      if (typeof window === 'undefined') {
        console.log(`[AITranslation] Inicializando modelo: ${this.modelName}`);
      }

      const startTime = Date.now();
      
      this.translator = await pipeline(
        'translation',
        this.modelName,
        {
          device: 'cpu', // Usar CPU por compatibilidade
          progress_callback: (progress: any) => {
            if (typeof window === 'undefined' && progress.status === 'downloading') {
              console.log(`[AITranslation] Download: ${progress.file} - ${Math.round(progress.progress || 0)}%`);
            }
          }
        }
      ) as TranslationPipeline;

      const initTime = Date.now() - startTime;
      this.isInitialized = true;

      if (typeof window === 'undefined') {
        console.log(`[AITranslation] Modelo inicializado em ${initTime}ms`);
      }
    } catch (error) {
      if (typeof window === 'undefined') {
        console.error('[AITranslation] Erro ao inicializar modelo:', error);
      }
      throw new Error(`Falha ao inicializar modelo de tradução: ${error}`);
    }
    */
  }

  /**
   * Verifica se o serviço está disponível
   * DESABILITADO - Sempre retorna false
   */
  async isAvailable(): Promise<boolean> {
    return false; // Sempre desabilitado
    
    /*
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      return this.translator !== null;
    } catch {
      return false;
    }
    */
  }

  /**
   * Traduz um texto usando o modelo de IA local
   * DESABILITADO - Para habilitar, descomente e instale dependências
   */
  async translateText(
    text: string,
    options: AITranslationOptions
  ): Promise<AITranslationResult> {
    throw new Error('Tradução por IA local está desabilitada. Para habilitar, instale @xenova/transformers e onnxruntime-node');
    
    /*
    if (!text || text.trim().length === 0) {
      throw new Error('Texto para tradução não pode estar vazio');
    }

    // Verificar cache primeiro
    if (options.useCache !== false) {
      const cacheKey = this._getCacheKey(text, options);
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return { ...cached, fromCache: true };
      }
    }

    // Garantir que o modelo está inicializado
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.translator) {
      throw new Error('Modelo de tradução não está disponível');
    }

    const startTime = Date.now();

    try {
      // Preparar texto para tradução
      const cleanText = this._preprocessText(text, options.maxLength);
      
      // Mapear códigos de idioma para o formato do modelo
      const sourceLanguage = this._mapLanguageCode(options.sourceLanguage || 'auto');
      const targetLanguage = this._mapLanguageCode(options.targetLanguage);

      if (typeof window === 'undefined') {
        console.log(`[AITranslation] Traduzindo: ${sourceLanguage} → ${targetLanguage}`);
      }

      // Executar tradução
      const result = await this.translator(cleanText, {
        src_lang: sourceLanguage,
        tgt_lang: targetLanguage,
        max_length: options.maxLength || 512
      });

      const processingTime = Date.now() - startTime;
      const translatedText = Array.isArray(result) ? result[0].translation_text : result.translation_text;

      // Calcular confiança baseada em heurísticas
      const confidence = this._calculateConfidence(text, translatedText, processingTime);

      const translationResult: AITranslationResult = {
        translatedText,
        confidence,
        provider: 'ai-local',
        fromCache: false,
        modelUsed: this.modelName,
        processingTime
      };

      // Adicionar ao cache
      if (options.useCache !== false) {
        this._addToCache(text, options, translationResult);
      }

      if (typeof window === 'undefined') {
        console.log(`[AITranslation] Tradução concluída em ${processingTime}ms (confiança: ${Math.round(confidence * 100)}%)`);
      }

      return translationResult;
    } catch (error) {
      if (typeof window === 'undefined') {
        console.error('[AITranslation] Erro na tradução:', error);
      }
      throw new Error(`Falha na tradução: ${error}`);
    }
    */
  }

  /**
   * Pré-processa o texto para tradução
   */
  private _preprocessText(text: string, maxLength?: number): string {
    let cleanText = text.trim();
    
    // Limitar tamanho se especificado
    if (maxLength && cleanText.length > maxLength) {
      cleanText = cleanText.substring(0, maxLength).trim();
      // Tentar cortar em uma palavra completa
      const lastSpace = cleanText.lastIndexOf(' ');
      if (lastSpace > maxLength * 0.8) {
        cleanText = cleanText.substring(0, lastSpace);
      }
    }

    return cleanText;
  }

  /**
   * Mapeia códigos de idioma para o formato esperado pelo modelo
   */
  private _mapLanguageCode(languageCode: string): string {
    const languageMap: Record<string, string> = {
      // Português
      'pt': 'por_Latn',
      'pt-BR': 'por_Latn',
      'pt-PT': 'por_Latn',
      'portuguese': 'por_Latn',
      
      // Inglês
      'en': 'eng_Latn',
      'en-US': 'eng_Latn',
      'en-GB': 'eng_Latn',
      'english': 'eng_Latn',
      
      // Espanhol
      'es': 'spa_Latn',
      'es-ES': 'spa_Latn',
      'spanish': 'spa_Latn',
      
      // Francês
      'fr': 'fra_Latn',
      'fr-FR': 'fra_Latn',
      'french': 'fra_Latn',
      
      // Alemão
      'de': 'deu_Latn',
      'de-DE': 'deu_Latn',
      'german': 'deu_Latn',
      
      // Italiano
      'it': 'ita_Latn',
      'it-IT': 'ita_Latn',
      'italian': 'ita_Latn',
      
      // Auto-detecção (usar inglês como padrão)
      'auto': 'eng_Latn'
    };

    const mapped = languageMap[languageCode.toLowerCase()];
    if (!mapped) {
      if (typeof window === 'undefined') {
        console.warn(`[AITranslation] Idioma não mapeado: ${languageCode}, usando inglês`);
      }
      return 'eng_Latn';
    }

    return mapped;
  }

  /**
   * Calcula a confiança da tradução baseada em heurísticas
   */
  private _calculateConfidence(
    originalText: string,
    translatedText: string,
    processingTime: number
  ): number {
    let confidence = 0.85; // Confiança base para NLLB

    // Ajustar baseado no tamanho do texto
    const textLength = originalText.length;
    if (textLength < 50) {
      confidence -= 0.1; // Textos muito curtos podem ser menos precisos
    } else if (textLength > 200) {
      confidence += 0.05; // Textos maiores tendem a ter melhor contexto
    }

    // Ajustar baseado no tempo de processamento
    if (processingTime > 5000) {
      confidence -= 0.05; // Processamento muito lento pode indicar problemas
    }

    // Verificar se a tradução não é idêntica ao original
    if (originalText.toLowerCase() === translatedText.toLowerCase()) {
      confidence -= 0.2; // Provavelmente não foi traduzido
    }

    // Verificar se a tradução não está vazia ou muito curta
    if (translatedText.length < originalText.length * 0.3) {
      confidence -= 0.15; // Tradução muito curta pode estar incompleta
    }

    // Garantir que a confiança está entre 0 e 1
    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Gera chave para cache
   */
  private _getCacheKey(text: string, options: AITranslationOptions): string {
    const source = options.sourceLanguage || 'auto';
    const target = options.targetLanguage;
    return `${source}-${target}-${text.substring(0, 100)}`;
  }

  /**
   * Adiciona resultado ao cache
   */
  private _addToCache(
    text: string,
    options: AITranslationOptions,
    result: AITranslationResult
  ): void {
    const cacheKey = this._getCacheKey(text, options);
    
    // Limpar cache se estiver muito grande
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(cacheKey, result);
  }

  /**
   * Obtém estatísticas do cache
   */
  getCacheStats(): { size: number; maxSize: number; hitRate?: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize
    };
  }

  /**
   * Limpa o cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Obtém informações sobre o modelo
   */
  getModelInfo(): { name: string; initialized: boolean } {
    return {
      name: this.modelName || AITranslationService.DEFAULT_MODEL,
      initialized: this.isInitialized
    };
  }
}

// Instância singleton para reutilização
let aiTranslationInstance: AITranslationService | null = null;

/**
 * Obtém a instância singleton do serviço de tradução IA
 */
export function getAITranslationService(modelName?: string): AITranslationService {
  if (!aiTranslationInstance || (modelName && aiTranslationInstance.getModelInfo().name !== modelName)) {
    aiTranslationInstance = new AITranslationService(modelName || 'Xenova/nllb-200-distilled-600M');
  }
  return aiTranslationInstance;
}