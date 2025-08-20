import { createHash } from 'crypto';

// Interface para o cache de traduções
interface ProfessionalTranslationCache {
  [key: string]: {
    translatedText: string;
    timestamp: number;
    sourceLanguage: string;
    targetLanguage: string;
    confidence: number;
    provider: string;
  };
}

// Interface para resultado da tradução
interface ProfessionalTranslationResult {
  translatedText: string;
  sourceLanguage: string;
  isTranslated: boolean;
  fromCache: boolean;
  confidence: number;
  provider: string;
  warning?: string;
}

// Interface para configuração de provedores
interface TranslationProvider {
  name: string;
  translate: (text: string, sourceLanguage: string, targetLanguage: string) => Promise<{
    translatedText: string;
    confidence: number;
  }>;
  isAvailable: () => boolean;
  supportedLanguages: string[];
}

/**
 * Serviço de tradução profissional com múltiplos provedores e fallback
 * 
 * Integra com APIs profissionais como Google Translate para oferecer
 * traduções de alta qualidade com precisão superior a 80%.
 */
export class ProfessionalTranslationService {
  private cache: ProfessionalTranslationCache = {};
  private readonly CACHE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias
  private readonly MAX_CACHE_SIZE = 2000;
  private readonly TARGET_LANGUAGE = 'pt'; // Português como idioma alvo
  private readonly MIN_CONFIDENCE_THRESHOLD = 0.8; // 80% de confiança mínima
  private providers: TranslationProvider[] = [];

  constructor() {
    this.initializeProviders();
  }

  /**
   * Inicializa os provedores de tradução disponíveis
   */
  private initializeProviders(): void {
    // Google Translate API Provider
    this.providers.push({
      name: 'google-translate',
      translate: this.translateWithGoogleAPI.bind(this),
      isAvailable: () => !!process.env.GOOGLE_TRANSLATE_API_KEY,
      supportedLanguages: ['en', 'pt', 'es', 'fr', 'de', 'it', 'ja', 'ko', 'zh', 'ar', 'ru']
    });

    // Fallback para o sistema básico existente
    this.providers.push({
      name: 'basic-translation',
      translate: this.translateWithBasicSystem.bind(this),
      isAvailable: () => true,
      supportedLanguages: ['en', 'pt']
    });
  }

  /**
   * Tradução usando Google Translate API
   */
  private async translateWithGoogleAPI(
    text: string, 
    sourceLanguage: string, 
    targetLanguage: string
  ): Promise<{ translatedText: string; confidence: number }> {
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    
    if (!apiKey) {
      throw new Error('Google Translate API key não configurada');
    }

    try {
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            source: sourceLanguage,
            target: targetLanguage,
            format: 'text'
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Google Translate API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.data?.translations?.[0]) {
        throw new Error('Resposta inválida da Google Translate API');
      }

      const translatedText = data.data.translations[0].translatedText;
      
      // Google Translate geralmente tem alta confiança
      const confidence = 0.9;
      
      // Log apenas no servidor
      if (typeof window === 'undefined') {
        console.log('Tradução realizada com Google Translate API', {
          sourceLanguage,
          targetLanguage,
          originalLength: text.length,
          translatedLength: translatedText.length,
          confidence
        });
      }

      return { translatedText, confidence };
    } catch (error) {
      // Log apenas no servidor
      if (typeof window === 'undefined') {
        console.error('Erro na Google Translate API', {
          error: error instanceof Error ? error.message : error,
          sourceLanguage,
          targetLanguage
        });
      }
      throw error;
    }
  }

  /**
   * Sistema de tradução básico como fallback
   */
  private async translateWithBasicSystem(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<{ translatedText: string; confidence: number }> {
    // Simulação de delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));

    if (sourceLanguage === 'en' && targetLanguage === 'pt') {
      const basicTranslations: { [key: string]: string } = {
        'abstract': 'resumo',
        'article': 'artigo',
        'research': 'pesquisa',
        'study': 'estudo',
        'analysis': 'análise',
        'development': 'desenvolvimento',
        'system': 'sistema',
        'method': 'método',
        'result': 'resultado',
        'results': 'resultados',
        'conclusion': 'conclusão',
        'objective': 'objetivo',
        'data': 'dados',
        'information': 'informação',
        'technology': 'tecnologia',
        'process': 'processo',
        'application': 'aplicação',
        'evaluation': 'avaliação',
        'treatment': 'tratamento',
        'behavior': 'comportamento',
        'patient': 'paciente',
        'patients': 'pacientes',
        'group': 'grupo',
        'control': 'controle',
        'significant': 'significativo',
        'effective': 'eficaz',
        'improvement': 'melhoria',
        'finding': 'achado',
        'findings': 'achados',
        'approach': 'abordagem',
        'technique': 'técnica',
        'program': 'programa',
        'training': 'treinamento',
        'education': 'educação',
        'learning': 'aprendizagem',
        'student': 'estudante',
        'students': 'estudantes',
        'performance': 'desempenho',
        'social': 'social',
        'health': 'saúde',
        'quality': 'qualidade',
        'support': 'apoio',
        'family': 'família',
        'children': 'crianças',
        'individual': 'indivíduo',
        'community': 'comunidade',
        'experience': 'experiência',
        'change': 'mudança',
        'factor': 'fator',
        'factors': 'fatores',
        'measure': 'medida',
        'test': 'teste',
        'increase': 'aumento',
        'reduce': 'reduzir',
        'improve': 'melhorar',
        'better': 'melhor',
        'important': 'importante',
        'successful': 'bem-sucedido',
        'problem': 'problema',
        'solution': 'solução',
        'benefit': 'benefício',
        'challenge': 'desafio'
      };

      let translatedText = text;
      
      Object.entries(basicTranslations).forEach(([english, portuguese]) => {
        const regex = new RegExp(`\\b${english}\\b`, 'gi');
        translatedText = translatedText.replace(regex, portuguese);
      });

      // Confiança baixa para sistema básico
      const confidence = 0.6;
      
      return { translatedText, confidence };
    }

    return { translatedText: text, confidence: 0.5 };
  }

  /**
   * Detecta o idioma do texto usando heurísticas melhoradas
   */
  private detectLanguage(text: string): string {
    if (!text || text.trim().length === 0) {
      return 'unknown';
    }

    const cleanText = text.toLowerCase().trim();
    
    // Heurísticas melhoradas para detecção de idioma
    const englishPatterns = [
      /\b(the|and|or|of|to|in|for|with|on|by|from|about|through|during|between|among)\b/g,
      /\b(that|this|these|those|not|are|is|was|were|will|would|can|could|should|has|had|have|being)\b/g,
      /\b(article|abstract|research|study|analysis|development|system|method|result|conclusion|objective)\b/g,
      /\b(significant|effective|important|successful|treatment|behavior|patient|group|control)\b/g
    ];

    const portuguesePatterns = [
      /\b(e|o|a|os|as|um|uma|de|da|do|das|dos|para|com|em|por|sobre|entre|durante|através)\b/g,
      /\b(que|este|esta|estes|estas|não|são|está|estava|estavam|será|seria|pode|poderia|deve|tem|tinha|terá|sendo)\b/g,
      /\b(artigo|resumo|pesquisa|estudo|análise|desenvolvimento|sistema|método|resultado|conclusão|objetivo)\b/g,
      /\b(significativo|eficaz|importante|bem-sucedido|tratamento|comportamento|paciente|grupo|controle)\b/g
    ];

    let englishScore = 0;
    let portugueseScore = 0;

    // Contar matches para inglês
    englishPatterns.forEach(pattern => {
      const matches = cleanText.match(pattern);
      if (matches) englishScore += matches.length;
    });

    // Contar matches para português
    portuguesePatterns.forEach(pattern => {
      const matches = cleanText.match(pattern);
      if (matches) portugueseScore += matches.length;
    });

    // Determinar idioma com base na pontuação
    if (englishScore > portugueseScore && englishScore > 2) {
      return 'en';
    } else if (portugueseScore > englishScore && portugueseScore > 2) {
      return 'pt';
    }

    // Fallback: assumir inglês se não conseguir detectar claramente
    return 'en';
  }

  /**
   * Gera uma chave de cache baseada no texto e idiomas
   */
  private generateCacheKey(text: string, sourceLanguage: string, targetLanguage: string): string {
    const content = `${text}|${sourceLanguage}|${targetLanguage}`;
    return createHash('md5').update(content).digest('hex');
  }

  /**
   * Limpa o cache removendo entradas expiradas
   */
  private cleanCache(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of Object.entries(this.cache)) {
      if (now - entry.timestamp > this.CACHE_EXPIRY_MS) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      delete this.cache[key];
    });

    // Limitar tamanho do cache
    const cacheKeys = Object.keys(this.cache);
    if (cacheKeys.length > this.MAX_CACHE_SIZE) {
      const keysToRemove = cacheKeys
        .sort((a, b) => this.cache[a].timestamp - this.cache[b].timestamp)
        .slice(0, cacheKeys.length - this.MAX_CACHE_SIZE);
      
      keysToRemove.forEach(key => {
        delete this.cache[key];
      });
    }
  }

  /**
   * Traduz um texto usando o melhor provedor disponível
   */
  async translateText(text: string): Promise<ProfessionalTranslationResult> {
    if (!text || text.trim().length === 0) {
      return {
        translatedText: '',
        sourceLanguage: 'unknown',
        isTranslated: false,
        fromCache: false,
        confidence: 0,
        provider: 'none',
        warning: 'Texto vazio fornecido'
      };
    }

    const cleanText = text.trim();
    const detectedLanguage = this.detectLanguage(cleanText);

    // Se já está em português, não traduzir
    if (detectedLanguage === this.TARGET_LANGUAGE) {
      return {
        translatedText: cleanText,
        sourceLanguage: detectedLanguage,
        isTranslated: false,
        fromCache: false,
        confidence: 1.0,
        provider: 'none'
      };
    }

    // Verificar cache
    const cacheKey = this.generateCacheKey(cleanText, detectedLanguage, this.TARGET_LANGUAGE);
    const cachedResult = this.cache[cacheKey];
    
    if (cachedResult && (Date.now() - cachedResult.timestamp) < this.CACHE_EXPIRY_MS) {
      // Log apenas no servidor
      if (typeof window === 'undefined') {
        console.log('Tradução encontrada no cache', {
          provider: cachedResult.provider,
          confidence: cachedResult.confidence
        });
      }
      
      return {
        translatedText: cachedResult.translatedText,
        sourceLanguage: cachedResult.sourceLanguage,
        isTranslated: true,
        fromCache: true,
        confidence: cachedResult.confidence,
        provider: cachedResult.provider,
        warning: cachedResult.confidence < this.MIN_CONFIDENCE_THRESHOLD 
          ? 'Tradução com baixa confiança - pode conter erros' 
          : undefined
      };
    }

    // Tentar traduzir com cada provedor disponível
    for (const provider of this.providers) {
      if (!provider.isAvailable()) {
        continue;
      }

      if (!provider.supportedLanguages.includes(detectedLanguage) || 
          !provider.supportedLanguages.includes(this.TARGET_LANGUAGE)) {
        continue;
      }

      try {
        const result = await provider.translate(cleanText, detectedLanguage, this.TARGET_LANGUAGE);
        
        // Salvar no cache
        this.cache[cacheKey] = {
          translatedText: result.translatedText,
          timestamp: Date.now(),
          sourceLanguage: detectedLanguage,
          targetLanguage: this.TARGET_LANGUAGE,
          confidence: result.confidence,
          provider: provider.name
        };

        // Limpar cache se necessário
        this.cleanCache();

        // Log apenas no servidor
        if (typeof window === 'undefined') {
          console.log('Tradução realizada com sucesso', {
            provider: provider.name,
            confidence: result.confidence,
            sourceLanguage: detectedLanguage,
            targetLanguage: this.TARGET_LANGUAGE
          });
        }

        return {
          translatedText: result.translatedText,
          sourceLanguage: detectedLanguage,
          isTranslated: true,
          fromCache: false,
          confidence: result.confidence,
          provider: provider.name,
          warning: result.confidence < this.MIN_CONFIDENCE_THRESHOLD 
            ? 'Tradução com baixa confiança - pode conter erros' 
            : undefined
        };
      } catch (error) {
        // Log apenas no servidor
        if (typeof window === 'undefined') {
          console.warn(`Falha no provedor ${provider.name}`, {
            error: error instanceof Error ? error.message : error
          });
        }
        continue;
      }
    }

    // Se todos os provedores falharam, retornar texto original
    if (typeof window === 'undefined') {
      console.error('Todos os provedores de tradução falharam');
    }
    
    return {
      translatedText: cleanText,
      sourceLanguage: detectedLanguage,
      isTranslated: false,
      fromCache: false,
      confidence: 0,
      provider: 'none',
      warning: 'Falha na tradução - exibindo texto original'
    };
  }

  /**
   * Obtém estatísticas do cache e provedores
   */
  getStats(): {
    cache: { size: number; maxSize: number; expiryMs: number };
    providers: { name: string; available: boolean; supportedLanguages: string[] }[];
  } {
    return {
      cache: {
        size: Object.keys(this.cache).length,
        maxSize: this.MAX_CACHE_SIZE,
        expiryMs: this.CACHE_EXPIRY_MS
      },
      providers: this.providers.map(provider => ({
        name: provider.name,
        available: provider.isAvailable(),
        supportedLanguages: provider.supportedLanguages
      }))
    };
  }

  /**
   * Limpa todo o cache de traduções
   */
  clearCache(): void {
    this.cache = {};
    if (typeof window === 'undefined') {
      console.log('Cache de traduções profissionais limpo');
    }
  }
}

// Instância singleton do serviço de tradução profissional
export const professionalTranslationService = new ProfessionalTranslationService();