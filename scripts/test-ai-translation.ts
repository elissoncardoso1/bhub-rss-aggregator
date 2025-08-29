#!/usr/bin/env tsx

// TRADUÇÃO POR IA LOCAL DESABILITADA
// Para reativar, instale: npm install @xenova/transformers onnxruntime-node
// e descomente o código abaixo

import { getTranslationManager, TranslationManager } from '../src/lib/translation/translationManager';
// import { getAITranslationService } from '../src/lib/translation/aiTranslationService';

/**
 * Script de teste para o sistema de tradução com IA local
 * 
 * AVISO: Este script está DESABILITADO
 * A tradução por IA local foi removida para reduzir o tamanho do bundle
 * 
 * Para reativar:
 * 1. Instale: npm install @xenova/transformers onnxruntime-node
 * 2. Descomente os imports e código necessário
 * 3. Reative o AITranslationService
 */

interface TestResult {
  text: string;
  translation: string;
  provider: string;
  confidence: number;
  processingTime: number;
  fromCache: boolean;
  success: boolean;
  error?: string;
}

class AITranslationTester {
  private translationManager: TranslationManager;
  private testTexts = {
    portuguese: [
      'Olá, como você está hoje?',
      'Este é um texto de teste para verificar a qualidade da tradução.',
      'A inteligência artificial está revolucionando a forma como trabalhamos.',
      'O sistema de tradução deve ser preciso e eficiente.',
      'Pesquisadores desenvolveram um novo método para melhorar a precisão das traduções automáticas.'
    ],
    english: [
      'Hello, how are you today?',
      'This is a test text to verify the quality of translation.',
      'Artificial intelligence is revolutionizing the way we work.',
      'The translation system should be accurate and efficient.',
      'Researchers have developed a new method to improve the accuracy of automatic translations.'
    ]
  };

  constructor() {
    this.translationManager = getTranslationManager();
  }

  /**
   * Executa todos os testes
   */
  async runAllTests(): Promise<void> {
    console.log('🚀 Iniciando testes do sistema de tradução com IA local\n');

    try {
      // Teste 1: Verificar disponibilidade dos provedores
      await this.testProviderAvailability();

      // Teste 2: Pré-carregar modelo de IA
      await this.testModelPreloading();

      // Teste 3: Tradução português → inglês
      await this.testPortugueseToEnglish();

      // Teste 4: Tradução inglês → português
      await this.testEnglishToPortuguese();

      // Teste 5: Teste de cache
      await this.testCaching();

      // Teste 6: Comparação de provedores
      await this.testProviderComparison();

      // Teste 7: Teste de fallback
      await this.testFallbackSystem();

      // Relatório final
      await this.generateFinalReport();

    } catch (error) {
      console.error('❌ Erro durante os testes:', error);
    }
  }

  /**
   * Testa disponibilidade dos provedores
   */
  private async testProviderAvailability(): Promise<void> {
    console.log('📋 Teste 1: Verificando disponibilidade dos provedores');
    
    try {
      const providers = await this.translationManager.getAvailableProviders();
      
      console.log('Provedores disponíveis:');
      console.log(`  • IA Local: ${providers['ai-local'] ? '✅' : '❌'}`);
      console.log(`  • Google Translate: ${providers['google-translate'] ? '✅' : '❌'}`);
      console.log(`  • Sistema Básico: ${providers['basic-translation'] ? '✅' : '❌'}`);
      
      if (!providers['ai-local']) {
        console.log('⚠️  IA Local não está disponível - modelo pode não estar carregado');
      }
      
    } catch (error) {
      console.error('❌ Erro ao verificar provedores:', error);
    }
    
    console.log('');
  }

  /**
   * Testa pré-carregamento do modelo
   */
  private async testModelPreloading(): Promise<void> {
    console.log('🔄 Teste 2: Pré-carregando modelo de IA');
    
    try {
      const startTime = Date.now();
      await this.translationManager.preloadAIModel();
      const loadTime = Date.now() - startTime;
      
      const modelInfo = this.translationManager.getAIModelInfo();
      console.log(`✅ Modelo carregado: ${modelInfo.name}`);
      console.log(`⏱️  Tempo de carregamento: ${loadTime}ms`);
      console.log(`📊 Status: ${modelInfo.initialized ? 'Inicializado' : 'Não inicializado'}`);
      
    } catch (error) {
      console.error('❌ Erro ao carregar modelo:', error);
    }
    
    console.log('');
  }

  /**
   * Testa tradução português → inglês
   */
  private async testPortugueseToEnglish(): Promise<void> {
    console.log('🇧🇷→🇺🇸 Teste 3: Tradução Português → Inglês');
    
    const results: TestResult[] = [];
    
    for (const text of this.testTexts.portuguese) {
      try {
        const startTime = Date.now();
        const result = await this.translationManager.translateText(text, {
          sourceLanguage: 'pt',
          targetLanguage: 'en',
          preferredProvider: 'ai-local'
        });
        const processingTime = Date.now() - startTime;
        
        results.push({
          text,
          translation: result.translatedText,
          provider: result.provider,
          confidence: result.confidence,
          processingTime,
          fromCache: result.fromCache,
          success: true
        });
        
        console.log(`✅ "${text.substring(0, 50)}..."`);
        console.log(`   → "${result.translatedText}"`);
        console.log(`   📊 Provedor: ${result.provider} | Confiança: ${Math.round(result.confidence * 100)}% | Tempo: ${processingTime}ms`);
        
      } catch (error) {
        results.push({
          text,
          translation: '',
          provider: 'none',
          confidence: 0,
          processingTime: 0,
          fromCache: false,
          success: false,
          error: error instanceof Error ? error.message : String(error)
        });
        
        console.log(`❌ Falha: "${text.substring(0, 50)}..."`);
        console.log(`   Erro: ${error}`);
      }
    }
    
    this.printTestSummary('Português → Inglês', results);
    console.log('');
  }

  /**
   * Testa tradução inglês → português
   */
  private async testEnglishToPortuguese(): Promise<void> {
    console.log('🇺🇸→🇧🇷 Teste 4: Tradução Inglês → Português');
    
    const results: TestResult[] = [];
    
    for (const text of this.testTexts.english) {
      try {
        const startTime = Date.now();
        const result = await this.translationManager.translateText(text, {
          sourceLanguage: 'en',
          targetLanguage: 'pt',
          preferredProvider: 'ai-local'
        });
        const processingTime = Date.now() - startTime;
        
        results.push({
          text,
          translation: result.translatedText,
          provider: result.provider,
          confidence: result.confidence,
          processingTime,
          fromCache: result.fromCache,
          success: true
        });
        
        console.log(`✅ "${text.substring(0, 50)}..."`);
        console.log(`   → "${result.translatedText}"`);
        console.log(`   📊 Provedor: ${result.provider} | Confiança: ${Math.round(result.confidence * 100)}% | Tempo: ${processingTime}ms`);
        
      } catch (error) {
        results.push({
          text,
          translation: '',
          provider: 'none',
          confidence: 0,
          processingTime: 0,
          fromCache: false,
          success: false,
          error: error instanceof Error ? error.message : String(error)
        });
        
        console.log(`❌ Falha: "${text.substring(0, 50)}..."`);
        console.log(`   Erro: ${error}`);
      }
    }
    
    this.printTestSummary('Inglês → Português', results);
    console.log('');
  }

  /**
   * Testa sistema de cache
   */
  private async testCaching(): Promise<void> {
    console.log('💾 Teste 5: Sistema de Cache');
    
    try {
      const testText = 'Este é um teste de cache do sistema de tradução.';
      
      // Primeira tradução (deve ir para cache)
      console.log('🔄 Primeira tradução (sem cache)...');
      const startTime1 = Date.now();
      const result1 = await this.translationManager.translateText(testText, {
        sourceLanguage: 'pt',
        targetLanguage: 'en',
        preferredProvider: 'ai-local'
      });
      const time1 = Date.now() - startTime1;
      
      console.log(`   ✅ Traduzido em ${time1}ms | Cache: ${result1.fromCache ? 'Sim' : 'Não'}`);
      
      // Segunda tradução (deve vir do cache)
      console.log('🔄 Segunda tradução (com cache)...');
      const startTime2 = Date.now();
      const result2 = await this.translationManager.translateText(testText, {
        sourceLanguage: 'pt',
        targetLanguage: 'en',
        preferredProvider: 'ai-local'
      });
      const time2 = Date.now() - startTime2;
      
      console.log(`   ✅ Traduzido em ${time2}ms | Cache: ${result2.fromCache ? 'Sim' : 'Não'}`);
      
      // Verificar informações do cache
      const cacheInfo = this.translationManager.getCacheInfo();
      console.log('📊 Informações do Cache:');
      console.log(`   • IA Local: ${cacheInfo.aiLocal.size}/${cacheInfo.aiLocal.maxSize}`);
      console.log(`   • Profissional: ${cacheInfo.professional.size}/${cacheInfo.professional.maxSize}`);
      
      if (result2.fromCache && time2 < time1) {
        console.log(`✅ Cache funcionando! Melhoria de ${Math.round(((time1 - time2) / time1) * 100)}%`);
      } else {
        console.log('⚠️  Cache pode não estar funcionando corretamente');
      }
      
    } catch (error) {
      console.error('❌ Erro no teste de cache:', error);
    }
    
    console.log('');
  }

  /**
   * Testa comparação entre provedores
   */
  private async testProviderComparison(): Promise<void> {
    console.log('⚖️  Teste 6: Comparação de Provedores');
    
    const testText = 'A inteligência artificial está transformando o mundo dos negócios.';
    const providers: ('ai-local' | 'google-translate' | 'basic-translation')[] = 
      ['ai-local', 'google-translate', 'basic-translation'];
    
    console.log(`🔤 Texto original: "${testText}"\n`);
    
    for (const provider of providers) {
      try {
        console.log(`🔄 Testando ${provider}...`);
        const startTime = Date.now();
        
        const result = await this.translationManager.translateText(testText, {
          sourceLanguage: 'pt',
          targetLanguage: 'en',
          preferredProvider: provider,
          enableFallback: false // Desabilitar fallback para teste específico
        });
        
        const processingTime = Date.now() - startTime;
        
        console.log(`   ✅ Resultado: "${result.translatedText}"`);
        console.log(`   📊 Confiança: ${Math.round(result.confidence * 100)}% | Tempo: ${processingTime}ms | Provedor usado: ${result.provider}`);
        
      } catch (error) {
        console.log(`   ❌ Falha com ${provider}: ${error}`);
      }
      
      console.log('');
    }
  }

  /**
   * Testa sistema de fallback
   */
  private async testFallbackSystem(): Promise<void> {
    console.log('🔄 Teste 7: Sistema de Fallback');
    
    try {
      const testText = 'Teste do sistema de fallback automático.';
      
      console.log(`🔤 Texto: "${testText}"`);
      console.log('🔄 Traduzindo com fallback habilitado...');
      
      const result = await this.translationManager.translateText(testText, {
        sourceLanguage: 'pt',
        targetLanguage: 'en',
        enableFallback: true
      });
      
      console.log(`✅ Tradução: "${result.translatedText}"`);
      console.log(`📊 Provedor usado: ${result.provider}`);
      console.log(`🔄 Fallback usado: ${result.fallbackUsed ? 'Sim' : 'Não'}`);
      console.log(`📊 Confiança: ${Math.round(result.confidence * 100)}%`);
      
    } catch (error) {
      console.error('❌ Erro no teste de fallback:', error);
    }
    
    console.log('');
  }

  /**
   * Gera relatório final
   */
  private async generateFinalReport(): Promise<void> {
    console.log('📊 RELATÓRIO FINAL');
    console.log('=' .repeat(50));
    
    try {
      // Estatísticas dos provedores
      const stats = this.translationManager.getProviderStats();
      
      console.log('\n📈 Estatísticas dos Provedores:');
      Object.entries(stats).forEach(([provider, stat]) => {
        if (stat.attempts > 0) {
          const successRate = Math.round((stat.successes / stat.attempts) * 100);
          const avgTime = stat.successes > 0 ? Math.round(stat.totalTime / stat.successes) : 0;
          
          console.log(`\n🔹 ${provider}:`);
          console.log(`   • Tentativas: ${stat.attempts}`);
          console.log(`   • Sucessos: ${stat.successes}`);
          console.log(`   • Falhas: ${stat.failures}`);
          console.log(`   • Taxa de sucesso: ${successRate}%`);
          console.log(`   • Tempo médio: ${avgTime}ms`);
        }
      });
      
      // Informações do modelo
      const modelInfo = this.translationManager.getAIModelInfo();
      console.log('\n🤖 Informações do Modelo de IA:');
      console.log(`   • Nome: ${modelInfo.name}`);
      console.log(`   • Inicializado: ${modelInfo.initialized ? 'Sim' : 'Não'}`);
      
      // Informações do cache
      const cacheInfo = this.translationManager.getCacheInfo();
      console.log('\n💾 Informações do Cache:');
      console.log(`   • IA Local: ${cacheInfo.aiLocal.size}/${cacheInfo.aiLocal.maxSize} entradas`);
      console.log(`   • Profissional: ${cacheInfo.professional.size}/${cacheInfo.professional.maxSize} entradas`);
      
      // Recomendações
      console.log('\n💡 Recomendações:');
      
      if (!modelInfo.initialized) {
        console.log('   ⚠️  Modelo de IA não foi inicializado - verifique a configuração');
      } else {
        console.log('   ✅ Modelo de IA funcionando corretamente');
      }
      
      const aiStats = stats['ai-local'];
      if (aiStats && aiStats.attempts > 0) {
        const aiSuccessRate = (aiStats.successes / aiStats.attempts) * 100;
        if (aiSuccessRate >= 80) {
          console.log('   ✅ IA Local com boa taxa de sucesso');
        } else {
          console.log('   ⚠️  IA Local com taxa de sucesso baixa - considere ajustes');
        }
      }
      
      console.log('\n🎉 Testes concluídos com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro ao gerar relatório final:', error);
    }
  }

  /**
   * Imprime resumo de um teste
   */
  private printTestSummary(testName: string, results: TestResult[]): void {
    const successful = results.filter(r => r.success).length;
    const total = results.length;
    const successRate = Math.round((successful / total) * 100);
    
    const avgConfidence = results
      .filter(r => r.success)
      .reduce((sum, r) => sum + r.confidence, 0) / successful || 0;
    
    const avgTime = results
      .filter(r => r.success)
      .reduce((sum, r) => sum + r.processingTime, 0) / successful || 0;
    
    console.log(`\n📊 Resumo ${testName}:`);
    console.log(`   • Taxa de sucesso: ${successful}/${total} (${successRate}%)`);
    console.log(`   • Confiança média: ${Math.round(avgConfidence * 100)}%`);
    console.log(`   • Tempo médio: ${Math.round(avgTime)}ms`);
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  const tester = new AITranslationTester();
  tester.runAllTests().catch(console.error);
}

export { AITranslationTester };