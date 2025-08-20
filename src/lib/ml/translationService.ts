import { createHash } from 'crypto';
import logger from '../logger';

// Interface para o cache de traduções
interface TranslationCache {
  [key: string]: {
    translatedText: string;
    timestamp: number;
    sourceLanguage: string;
    targetLanguage: string;
  };
}

// Interface para resultado da tradução
interface TranslationResult {
  translatedText: string;
  sourceLanguage: string;
  isTranslated: boolean;
  fromCache: boolean;
  warning?: string;
}

/**
 * Serviço de tradução automática com cache e detecção de idioma
 * 
 * AVISO: As traduções são feitas automaticamente e podem conter erros.
 * Este serviço é otimizado para performance e não garante 100% de precisão.
 */
export class TranslationService {
  private cache: TranslationCache = {};
  private readonly CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 horas
  private readonly MAX_CACHE_SIZE = 1000;
  private readonly TARGET_LANGUAGE = 'en'; // Inglês como idioma alvo
  private readonly TRANSLATION_WARNING = 'Tradução automática - pode conter erros';

  /**
   * Detecta o idioma do texto usando heurísticas simples
   * @param text Texto para detectar o idioma
   * @returns Código do idioma detectado
   */
  private detectLanguage(text: string): string {
    if (!text || text.trim().length === 0) {
      return 'unknown';
    }

    const cleanText = text.toLowerCase().trim();
    
    // Heurísticas para detecção de idioma
    const portuguesePatterns = [
      /\b(e|o|a|os|as|um|uma|de|da|do|das|dos|para|com|em|por|sobre|entre|durante|através|mediante)\b/g,
      /\b(que|não|são|está|foram|será|pode|deve|tem|tinha|terá|sendo)\b/g,
      /\b(artigo|resumo|pesquisa|estudo|análise|desenvolvimento|sistema|método|resultado|conclusão)\b/g,
      /ção\b/g,
      /mente\b/g
    ];

    const englishPatterns = [
      /\b(the|and|or|of|to|in|for|with|on|by|from|about|through|during|between)\b/g,
      /\b(that|not|are|is|were|will|can|should|has|had|have|being)\b/g,
      /\b(article|abstract|research|study|analysis|development|system|method|result|conclusion)\b/g,
      /\b\w+ing\b/g,
      /\b\w+ed\b/g
    ];

    const spanishPatterns = [
      /\b(y|o|el|la|los|las|un|una|de|del|para|con|en|por|sobre|entre|durante)\b/g,
      /\b(que|no|son|está|fueron|será|puede|debe|tiene|tenía|tendrá|siendo)\b/g,
      /\b(artículo|resumen|investigación|estudio|análisis|desarrollo|sistema|método|resultado|conclusión)\b/g,
      /ción\b/g,
      /mente\b/g
    ];

    let portugueseScore = 0;
    let englishScore = 0;
    let spanishScore = 0;

    // Contar matches para português
    portuguesePatterns.forEach(pattern => {
      const matches = cleanText.match(pattern);
      if (matches) portugueseScore += matches.length;
    });

    // Contar matches para inglês
    englishPatterns.forEach(pattern => {
      const matches = cleanText.match(pattern);
      if (matches) englishScore += matches.length;
    });

    // Contar matches para espanhol
    spanishPatterns.forEach(pattern => {
      const matches = cleanText.match(pattern);
      if (matches) spanishScore += matches.length;
    });

    // Determinar idioma com base na pontuação
    if (portugueseScore > englishScore && portugueseScore > spanishScore) {
      return 'pt';
    } else if (spanishScore > englishScore && spanishScore > portugueseScore) {
      return 'es';
    } else if (englishScore > 0) {
      return 'en';
    }

    // Fallback: assumir português se não conseguir detectar
    return 'pt';
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

    keysToDelete.forEach(key => delete this.cache[key]);

    // Se ainda estiver muito grande, remover as entradas mais antigas
    const cacheKeys = Object.keys(this.cache);
    if (cacheKeys.length > this.MAX_CACHE_SIZE) {
      const sortedEntries = cacheKeys
        .map(key => ({ key, timestamp: this.cache[key].timestamp }))
        .sort((a, b) => a.timestamp - b.timestamp);

      const keysToRemove = sortedEntries
        .slice(0, cacheKeys.length - this.MAX_CACHE_SIZE)
        .map(entry => entry.key);

      keysToRemove.forEach(key => delete this.cache[key]);
    }
  }

  /**
   * Traduz texto usando uma API de tradução simples (mock)
   * Em produção, isso seria substituído por uma API real como Google Translate
   */
  private async translateText(text: string, sourceLanguage: string, targetLanguage: string): Promise<string> {
    // Simulação de tradução - em produção usar API real
    // Por enquanto, retorna o texto original com um prefixo indicando tradução
    
    if (sourceLanguage === targetLanguage) {
      return text;
    }

    // Simulação de delay de API (100-300ms)
    await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));

    // Mock de tradução básica para demonstração
    // Em produção, integrar com Google Translate API, DeepL, etc.
    if (sourceLanguage === 'pt' && targetLanguage === 'en') {
      // Algumas traduções básicas para demonstração
      const basicTranslations: { [key: string]: string } = {
        'resumo': 'abstract',
        'artigo': 'article',
        'pesquisa': 'research',
        'estudo': 'study',
        'análise': 'analysis',
        'desenvolvimento': 'development',
        'sistema': 'system',
        'método': 'method',
        'resultado': 'result',
        'conclusão': 'conclusion',
        'objetivo': 'objective',
        'metodologia': 'methodology',
        'dados': 'data',
        'informação': 'information',
        'tecnologia': 'technology',
        'inovação': 'innovation',
        'processo': 'process',
        'modelo': 'model',
        'aplicação': 'application',
        'implementação': 'implementation'
      };

      let translatedText = text;
      for (const [pt, en] of Object.entries(basicTranslations)) {
        const regex = new RegExp(`\\b${pt}\\b`, 'gi');
        translatedText = translatedText.replace(regex, en);
      }

      return translatedText;
    }

    // Para outros idiomas, retorna o texto original
    return text;
  }

  /**
   * Traduz um texto para o idioma alvo com cache
   * @param text Texto a ser traduzido
   * @returns Resultado da tradução com metadados
   */
  async translate(text: string): Promise<TranslationResult> {
    try {
      if (!text || text.trim().length === 0) {
        return {
          translatedText: text,
          sourceLanguage: 'unknown',
          isTranslated: false,
          fromCache: false
        };
      }

      // Detectar idioma do texto
      const sourceLanguage = this.detectLanguage(text);
      
      // Se já está em inglês, não precisa traduzir
      if (sourceLanguage === this.TARGET_LANGUAGE) {
        return {
          translatedText: text,
          sourceLanguage,
          isTranslated: false,
          fromCache: false
        };
      }

      // Verificar cache
      const cacheKey = this.generateCacheKey(text, sourceLanguage, this.TARGET_LANGUAGE);
      const cachedEntry = this.cache[cacheKey];
      
      if (cachedEntry && (Date.now() - cachedEntry.timestamp) < this.CACHE_EXPIRY_MS) {
        logger.debug('Translation found in cache', { cacheKey, sourceLanguage });
        return {
          translatedText: cachedEntry.translatedText,
          sourceLanguage: cachedEntry.sourceLanguage,
          isTranslated: true,
          fromCache: true,
          warning: this.TRANSLATION_WARNING
        };
      }

      // Traduzir texto
      const translatedText = await this.translateText(text, sourceLanguage, this.TARGET_LANGUAGE);
      
      // Salvar no cache
      this.cache[cacheKey] = {
        translatedText,
        timestamp: Date.now(),
        sourceLanguage,
        targetLanguage: this.TARGET_LANGUAGE
      };

      // Limpar cache se necessário
      this.cleanCache();

      logger.debug('Text translated and cached', { 
        sourceLanguage, 
        targetLanguage: this.TARGET_LANGUAGE,
        originalLength: text.length,
        translatedLength: translatedText.length
      });

      return {
        translatedText,
        sourceLanguage,
        isTranslated: true,
        fromCache: false,
        warning: this.TRANSLATION_WARNING
      };

    } catch (error) {
      logger.error('Translation failed', { error: error instanceof Error ? error.message : error });
      
      // Em caso de erro, retorna o texto original
      return {
        translatedText: text,
        sourceLanguage: 'unknown',
        isTranslated: false,
        fromCache: false,
        warning: 'Falha na tradução - usando texto original'
      };
    }
  }

  /**
   * Obtém estatísticas do cache
   */
  getCacheStats(): { size: number; maxSize: number; expiryMs: number } {
    return {
      size: Object.keys(this.cache).length,
      maxSize: this.MAX_CACHE_SIZE,
      expiryMs: this.CACHE_EXPIRY_MS
    };
  }

  /**
   * Limpa todo o cache
   */
  clearCache(): void {
    this.cache = {};
    logger.info('Translation cache cleared');
  }
}

// Instância singleton do serviço de tradução
export const translationService = new TranslationService();