import { AITranslationService, AITranslationResult, AITranslationOptions, getAITranslationService } from './aiTranslationService';
import { ProfessionalTranslationService } from './professionalTranslationService';

// Interface para resultado de tradução do serviço profissional
interface ProfessionalTranslationResult {
  translatedText: string;
  sourceLanguage: string;
  isTranslated: boolean;
  fromCache: boolean;
  confidence: number;
  provider: string;
  warning?: string;
}

export interface UnifiedTranslationResult {
  translatedText: string;
  confidence: number;
  provider: 'ai-local' | 'google-translate' | 'basic-translation';
  fromCache: boolean;
  processingTime: number;
  fallbackUsed?: boolean;
  modelUsed?: string;
}

export interface TranslationManagerOptions {
  sourceLanguage?: string;
  targetLanguage: string;
  maxLength?: number;
  useCache?: boolean;
  preferredProvider?: 'ai-local' | 'google-translate' | 'basic-translation';
  enableFallback?: boolean;
}

/**
 * Gerenciador unificado de tradução que coordena múltiplos provedores
 * com sistema de fallback inteligente
 * 
 * NOTA: Tradução por IA local está DESABILITADA
 * Para habilitar, instale @xenova/transformers e onnxruntime-node
 */
export class TranslationManager {
  private aiTranslationService: AITranslationService;
  private professionalTranslationService: ProfessionalTranslationService;
  private providerStats = {
    'ai-local': { attempts: 0, successes: 0, failures: 0, totalTime: 0 },
    'google-translate': { attempts: 0, successes: 0, failures: 0, totalTime: 0 },
    'basic-translation': { attempts: 0, successes: 0, failures: 0, totalTime: 0 }
  };

  constructor(aiModelName?: string) {
    this.aiTranslationService = getAITranslationService(aiModelName);
    this.professionalTranslationService = new ProfessionalTranslationService();
  }

  /**
   * Traduz texto usando a estratégia de fallback inteligente
   */
  async translateText(
    text: string,
    options: TranslationManagerOptions
  ): Promise<UnifiedTranslationResult> {
    if (!text || text.trim().length === 0) {
      throw new Error('Texto para tradução não pode estar vazio');
    }

    const startTime = Date.now();
    let lastError: Error | null = null;
    let fallbackUsed = false;

    // Definir ordem dos provedores baseada na preferência e disponibilidade
    const providers = this._getProviderOrder(options.preferredProvider);

    if (typeof window === 'undefined') {
      console.log(`[TranslationManager] Iniciando tradução com ${providers.length} provedores`);
    }

    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i];
      
      if (i > 0) {
        fallbackUsed = true;
        if (typeof window === 'undefined') {
          console.log(`[TranslationManager] Tentando fallback: ${provider}`);
        }
      }

      try {
        const result = await this._translateWithProvider(provider, text, options);
        
        // Atualizar estatísticas de sucesso
        this.providerStats[provider].attempts++;
        this.providerStats[provider].successes++;
        this.providerStats[provider].totalTime += result.processingTime;

        const totalTime = Date.now() - startTime;
        
        if (typeof window === 'undefined') {
          console.log(`[TranslationManager] Tradução bem-sucedida com ${provider} em ${totalTime}ms`);
        }

        return {
          ...result,
          fallbackUsed,
          processingTime: totalTime
        };
      } catch (error) {
        lastError = error as Error;
        
        // Atualizar estatísticas de falha
        this.providerStats[provider].attempts++;
        this.providerStats[provider].failures++;

        if (typeof window === 'undefined') {
          console.warn(`[TranslationManager] Falha com ${provider}:`, error);
        }

        // Se não é o último provedor e fallback está habilitado, continuar
        if (i < providers.length - 1 && options.enableFallback !== false) {
          continue;
        }
      }
    }

    // Se chegou aqui, todos os provedores falharam
    const totalTime = Date.now() - startTime;
    if (typeof window === 'undefined') {
      console.error(`[TranslationManager] Todos os provedores falharam em ${totalTime}ms`);
    }
    
    throw new Error(`Falha em todos os provedores de tradução. Último erro: ${lastError?.message}`);
  }

  /**
   * Traduz usando um provedor específico
   */
  private async _translateWithProvider(
    provider: 'ai-local' | 'google-translate' | 'basic-translation',
    text: string,
    options: TranslationManagerOptions
  ): Promise<UnifiedTranslationResult> {
    const startTime = Date.now();

    switch (provider) {
      case 'ai-local':
        return await this._translateWithAI(text, options, startTime);
      
      case 'google-translate':
      case 'basic-translation':
        return await this._translateWithProfessional(text, options, startTime);
      
      default:
        throw new Error(`Provedor desconhecido: ${provider}`);
    }
  }

  /**
   * Traduz usando o serviço de IA local
   */
  private async _translateWithAI(
    text: string,
    options: TranslationManagerOptions,
    startTime: number
  ): Promise<UnifiedTranslationResult> {
    // Verificar se o serviço está disponível
    const isAvailable = await this.aiTranslationService.isAvailable();
    if (!isAvailable) {
      throw new Error('Serviço de IA local não está disponível');
    }

    const aiOptions: AITranslationOptions = {
      sourceLanguage: options.sourceLanguage,
      targetLanguage: options.targetLanguage,
      maxLength: options.maxLength,
      useCache: options.useCache
    };

    const result = await this.aiTranslationService.translateText(text, aiOptions);
    
    return {
      translatedText: result.translatedText,
      confidence: result.confidence,
      provider: 'ai-local',
      fromCache: result.fromCache,
      processingTime: Date.now() - startTime,
      modelUsed: result.modelUsed
    };
  }

  /**
   * Traduz usando o serviço profissional (Google API ou básico)
   */
  private async _translateWithProfessional(
    text: string,
    options: TranslationManagerOptions,
    startTime: number
  ): Promise<UnifiedTranslationResult> {
    const result = await this.professionalTranslationService.translateText(text);

    // Mapear o provider do resultado
    let provider: 'google-translate' | 'basic-translation';
    if (result.provider === 'google-translate') {
      provider = 'google-translate';
    } else {
      provider = 'basic-translation';
    }

    return {
      translatedText: result.translatedText,
      confidence: result.confidence,
      provider,
      fromCache: result.fromCache,
      processingTime: Date.now() - startTime
    };
  }

  /**
   * Define a ordem dos provedores baseada na preferência e estratégia
   */
  private _getProviderOrder(
    preferredProvider?: 'ai-local' | 'google-translate' | 'basic-translation'
  ): ('ai-local' | 'google-translate' | 'basic-translation')[] {
    // Ordem padrão: Google Translate → Básico (IA local desabilitada)
    const defaultOrder: ('ai-local' | 'google-translate' | 'basic-translation')[] = [
      'google-translate',
      'basic-translation'
    ];

    // Se especificamente solicitado IA local, incluir (mas falhará)
    if (preferredProvider === 'ai-local') {
      return ['ai-local', 'google-translate', 'basic-translation'];
    }

    if (!preferredProvider) {
      return defaultOrder;
    }

    // Colocar o provedor preferido primeiro
    const reorderedProviders: ('ai-local' | 'google-translate' | 'basic-translation')[] = [preferredProvider];
    const allProviders: ('ai-local' | 'google-translate' | 'basic-translation')[] = ['google-translate', 'basic-translation'];
    
    allProviders.forEach(provider => {
      if (provider !== preferredProvider) {
        reorderedProviders.push(provider);
      }
    });

    return reorderedProviders;
  }

  /**
   * Verifica quais provedores estão disponíveis
   */
  async getAvailableProviders(): Promise<{
    'ai-local': boolean;
    'google-translate': boolean;
    'basic-translation': boolean;
  }> {
    const aiAvailable = await this.aiTranslationService.isAvailable().catch(() => false);
    const professionalAvailable = true; // Sempre disponível (tem fallback interno)

    return {
      'ai-local': aiAvailable,
      'google-translate': professionalAvailable, // Assume que se profissional está disponível, Google também
      'basic-translation': true // Sempre disponível
    };
  }

  /**
   * Obtém estatísticas de uso dos provedores
   */
  getProviderStats(): typeof this.providerStats {
    // Calcular taxas de sucesso e tempo médio
    const stats = { ...this.providerStats };
    
    Object.keys(stats).forEach(provider => {
      const providerStats = stats[provider as keyof typeof stats];
      if (providerStats.attempts > 0) {
        (providerStats as any).successRate = providerStats.successes / providerStats.attempts;
        (providerStats as any).averageTime = providerStats.totalTime / providerStats.successes || 0;
      }
    });

    return stats;
  }

  /**
   * Reseta as estatísticas dos provedores
   */
  resetStats(): void {
    Object.keys(this.providerStats).forEach(provider => {
      this.providerStats[provider as keyof typeof this.providerStats] = {
        attempts: 0,
        successes: 0,
        failures: 0,
        totalTime: 0
      };
    });
  }

  /**
   * Obtém informações sobre o cache dos provedores
   */
  getCacheInfo(): {
    aiLocal: { size: number; maxSize: number };
    professional: { size: number; maxSize: number; expiryMs: number };
  } {
    const professionalStats = this.professionalTranslationService.getStats();
    return {
      aiLocal: this.aiTranslationService.getCacheStats(),
      professional: professionalStats.cache
    };
  }

  /**
   * Limpa o cache de todos os provedores
   */
  clearAllCaches(): void {
    this.aiTranslationService.clearCache();
    this.professionalTranslationService.clearCache();
  }

  /**
   * Pré-carrega o modelo de IA (útil para inicialização)
   */
  async preloadAIModel(): Promise<void> {
    try {
      await this.aiTranslationService.initialize();
      if (typeof window === 'undefined') {
        console.log('[TranslationManager] Modelo de IA pré-carregado com sucesso');
      }
    } catch (error) {
      if (typeof window === 'undefined') {
        console.warn('[TranslationManager] Falha ao pré-carregar modelo de IA:', error);
      }
    }
  }

  /**
   * Obtém informações sobre o modelo de IA
   */
  getAIModelInfo(): { name: string; initialized: boolean } {
    return this.aiTranslationService.getModelInfo();
  }
}

// Instância singleton para reutilização
let translationManagerInstance: TranslationManager | null = null;

/**
 * Obtém a instância singleton do gerenciador de tradução
 */
export function getTranslationManager(aiModelName?: string): TranslationManager {
  if (!translationManagerInstance || 
      (aiModelName && translationManagerInstance.getAIModelInfo().name !== aiModelName)) {
    translationManagerInstance = new TranslationManager(aiModelName);
  }
  return translationManagerInstance;
}

/**
 * Função de conveniência para tradução rápida
 */
export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage?: string,
  options?: Partial<TranslationManagerOptions>
): Promise<UnifiedTranslationResult> {
  const manager = getTranslationManager();
  
  return manager.translateText(text, {
    sourceLanguage,
    targetLanguage,
    ...options
  });
}