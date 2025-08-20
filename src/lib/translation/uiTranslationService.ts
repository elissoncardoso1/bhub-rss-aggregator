import { createHash } from 'crypto';

// Interface para o cache de traduções
interface UITranslationCache {
  [key: string]: {
    translatedText: string;
    timestamp: number;
    sourceLanguage: string;
    targetLanguage: string;
  };
}

// Interface para resultado da tradução
interface UITranslationResult {
  translatedText: string;
  sourceLanguage: string;
  isTranslated: boolean;
  fromCache: boolean;
  warning?: string;
}

/**
 * Serviço de tradução para UI - traduz resumos do inglês para português
 * 
 * AVISO: As traduções são feitas automaticamente e podem conter erros.
 * Este serviço é otimizado para performance e não garante 100% de precisão.
 */
export class UITranslationService {
  private cache: UITranslationCache = {};
  private readonly CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 horas
  private readonly MAX_CACHE_SIZE = 1000;
  private readonly TARGET_LANGUAGE = 'pt'; // Português como idioma alvo
  private readonly TRANSLATION_WARNING = 'Tradução automática - pode conter erros';

  /**
   * Detecta o idioma do texto usando heurísticas simples
   */
  private detectLanguage(text: string): string {
    if (!text || text.trim().length === 0) {
      return 'unknown';
    }

    const cleanText = text.toLowerCase().trim();
    
    // Heurísticas para detecção de idioma
    const englishPatterns = [
      /\b(the|and|or|of|to|in|for|with|on|by|from|about|through|during|between)\b/g,
      /\b(that|not|are|is|were|will|can|should|has|had|have|being)\b/g,
      /\b(article|abstract|research|study|analysis|development|system|method|result|conclusion)\b/g
    ];

    const portuguesePatterns = [
      /\b(e|o|a|os|as|um|uma|de|da|do|das|dos|para|com|em|por|sobre|entre|durante)\b/g,
      /\b(que|não|são|está|foram|será|pode|deve|tem|tinha|terá|sendo)\b/g,
      /\b(artigo|resumo|pesquisa|estudo|análise|desenvolvimento|sistema|método|resultado|conclusão)\b/g
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
    if (englishScore > portugueseScore) {
      return 'en';
    } else if (portugueseScore > englishScore) {
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
   * Traduz texto do inglês para português usando traduções básicas
   */
  private async translateText(text: string, sourceLanguage: string, targetLanguage: string): Promise<string> {
    if (sourceLanguage === targetLanguage) {
      return text;
    }

    // Simulação de delay de API (50-150ms)
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));

    // Tradução básica do inglês para português
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
      
      // Aplicar traduções básicas palavra por palavra
      Object.entries(basicTranslations).forEach(([english, portuguese]) => {
        const regex = new RegExp(`\\b${english}\\b`, 'gi');
        translatedText = translatedText.replace(regex, portuguese);
      });

      return translatedText;
    }

    // Para outros idiomas, retornar o texto original
    return text;
  }

  /**
   * Traduz um resumo de artigo do inglês para português
   */
  async translateAbstract(text: string): Promise<UITranslationResult> {
    if (!text || text.trim().length === 0) {
      return {
        translatedText: '',
        sourceLanguage: 'unknown',
        isTranslated: false,
        fromCache: false,
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
        fromCache: false
      };
    }

    // Verificar cache
    const cacheKey = this.generateCacheKey(cleanText, detectedLanguage, this.TARGET_LANGUAGE);
    const cachedResult = this.cache[cacheKey];
    
    if (cachedResult && (Date.now() - cachedResult.timestamp) < this.CACHE_EXPIRY_MS) {
      return {
        translatedText: cachedResult.translatedText,
        sourceLanguage: cachedResult.sourceLanguage,
        isTranslated: true,
        fromCache: true,
        warning: this.TRANSLATION_WARNING
      };
    }

    try {
      // Traduzir texto
      const translatedText = await this.translateText(cleanText, detectedLanguage, this.TARGET_LANGUAGE);
      
      // Salvar no cache
      this.cache[cacheKey] = {
        translatedText,
        timestamp: Date.now(),
        sourceLanguage: detectedLanguage,
        targetLanguage: this.TARGET_LANGUAGE
      };

      // Limpar cache se necessário
      this.cleanCache();

      return {
        translatedText,
        sourceLanguage: detectedLanguage,
        isTranslated: true,
        fromCache: false,
        warning: this.TRANSLATION_WARNING
      };
    } catch (error) {
      console.error('Erro na tradução:', error);
      
      return {
        translatedText: cleanText,
        sourceLanguage: detectedLanguage,
        isTranslated: false,
        fromCache: false,
        warning: 'Erro na tradução - exibindo texto original'
      };
    }
  }

  /**
   * Limpa todo o cache de traduções
   */
  clearCache(): void {
    this.cache = {};
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
}

// Instância singleton do serviço de tradução para UI
export const uiTranslationService = new UITranslationService();