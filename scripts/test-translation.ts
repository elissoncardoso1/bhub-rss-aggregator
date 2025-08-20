#!/usr/bin/env tsx

/**
 * Script para testar o novo sistema de tradução profissional
 * 
 * Execute com: npx tsx scripts/test-translation.ts
 */

import { professionalTranslationService } from '../src/lib/translation/professionalTranslationService';

// Textos de teste em inglês (típicos de resumos acadêmicos)
const testTexts = [
  "This study examines the effectiveness of cognitive behavioral therapy in treating anxiety disorders among adolescents.",
  "The research methodology involved a randomized controlled trial with 150 participants over a 12-month period.",
  "Results indicate significant improvement in patient outcomes when using the proposed treatment approach.",
  "The analysis reveals important factors that contribute to successful intervention strategies in clinical settings.",
  "This article presents a comprehensive review of recent developments in artificial intelligence applications.",
  "The findings suggest that early intervention programs can reduce the risk of developing chronic conditions.",
  "Participants showed measurable improvements in quality of life scores after completing the training program.",
  "The study concludes that further research is needed to validate these preliminary results in larger populations."
];

async function testTranslation() {
  console.log('🧪 Testando Sistema de Tradução Profissional\n');
  console.log('=' .repeat(80));
  
  // Verificar estatísticas iniciais
  const initialStats = professionalTranslationService.getStats();
  console.log('📊 Estatísticas Iniciais:');
  console.log(`   Cache: ${initialStats.cache.size}/${initialStats.cache.maxSize} entradas`);
  console.log('   Provedores disponíveis:');
  initialStats.providers.forEach(provider => {
    const status = provider.available ? '✅ Disponível' : '❌ Indisponível';
    console.log(`     - ${provider.name}: ${status} (${provider.supportedLanguages.join(', ')})`);
  });
  console.log();

  let totalTests = 0;
  let successfulTranslations = 0;
  let highConfidenceTranslations = 0;
  let cacheHits = 0;
  let googleTranslateUsed = 0;
  
  for (let i = 0; i < testTexts.length; i++) {
    const originalText = testTexts[i];
    totalTests++;
    
    console.log(`🔤 Teste ${i + 1}/${testTexts.length}`);
    console.log(`📝 Original: ${originalText.substring(0, 80)}${originalText.length > 80 ? '...' : ''}`);
    
    try {
      const startTime = Date.now();
      const result = await professionalTranslationService.translateText(originalText);
      const duration = Date.now() - startTime;
      
      console.log(`🔄 Traduzido: ${result.translatedText.substring(0, 80)}${result.translatedText.length > 80 ? '...' : ''}`);
      console.log(`📊 Detalhes:`);
      console.log(`   - Idioma detectado: ${result.sourceLanguage}`);
      console.log(`   - Traduzido: ${result.isTranslated ? 'Sim' : 'Não'}`);
      console.log(`   - Do cache: ${result.fromCache ? 'Sim' : 'Não'}`);
      console.log(`   - Confiança: ${(result.confidence * 100).toFixed(1)}%`);
      console.log(`   - Provedor: ${result.provider}`);
      console.log(`   - Tempo: ${duration}ms`);
      
      if (result.warning) {
        console.log(`   ⚠️  Aviso: ${result.warning}`);
      }
      
      // Estatísticas
      if (result.isTranslated) successfulTranslations++;
      if (result.confidence >= 0.8) highConfidenceTranslations++;
      if (result.fromCache) cacheHits++;
      if (result.provider === 'google-translate') googleTranslateUsed++;
      
    } catch (error) {
      console.log(`❌ Erro: ${error instanceof Error ? error.message : error}`);
    }
    
    console.log('-'.repeat(80));
  }
  
  // Teste de cache - repetir primeira tradução
  console.log('\n🔄 Testando Cache - Repetindo primeira tradução...');
  try {
    const startTime = Date.now();
    const result = await professionalTranslationService.translateText(testTexts[0]);
    const duration = Date.now() - startTime;
    
    console.log(`⚡ Cache hit: ${result.fromCache ? 'Sim' : 'Não'} (${duration}ms)`);
    if (result.fromCache) cacheHits++;
  } catch (error) {
    console.log(`❌ Erro no teste de cache: ${error instanceof Error ? error.message : error}`);
  }
  
  // Estatísticas finais
  console.log('\n' + '='.repeat(80));
  console.log('📈 RELATÓRIO FINAL');
  console.log('='.repeat(80));
  console.log(`📊 Testes realizados: ${totalTests}`);
  console.log(`✅ Traduções bem-sucedidas: ${successfulTranslations}/${totalTests} (${(successfulTranslations/totalTests*100).toFixed(1)}%)`);
  console.log(`🎯 Alta confiança (≥80%): ${highConfidenceTranslations}/${totalTests} (${(highConfidenceTranslations/totalTests*100).toFixed(1)}%)`);
  console.log(`⚡ Cache hits: ${cacheHits}`);
  console.log(`🌐 Google Translate usado: ${googleTranslateUsed}/${totalTests} (${(googleTranslateUsed/totalTests*100).toFixed(1)}%)`);
  
  const finalStats = professionalTranslationService.getStats();
  console.log(`💾 Cache final: ${finalStats.cache.size}/${finalStats.cache.maxSize} entradas`);
  
  // Avaliação da qualidade
  console.log('\n🎯 AVALIAÇÃO DE QUALIDADE:');
  if (highConfidenceTranslations / totalTests >= 0.8) {
    console.log('✅ EXCELENTE: Mais de 80% das traduções com alta confiança');
  } else if (highConfidenceTranslations / totalTests >= 0.6) {
    console.log('⚠️  BOM: Entre 60-80% das traduções com alta confiança');
  } else {
    console.log('❌ PRECISA MELHORAR: Menos de 60% das traduções com alta confiança');
  }
  
  if (googleTranslateUsed === 0) {
    console.log('⚠️  ATENÇÃO: Google Translate API não foi usada. Verifique a configuração da chave de API.');
    console.log('   Configure GOOGLE_TRANSLATE_API_KEY no arquivo .env para melhor precisão.');
  }
  
  console.log('\n🏁 Teste concluído!');
}

// Executar teste
if (require.main === module) {
  testTranslation().catch(error => {
    console.error('❌ Erro durante o teste:', error);
    process.exit(1);
  });
}

export { testTranslation };