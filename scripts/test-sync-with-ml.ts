#!/usr/bin/env tsx

import { syncAllFeeds } from '../src/jobs/syncFeeds'

/**
 * Script para testar a sincronização completa com sistema de ML
 */
async function testSyncWithML() {
  console.log('🔄 Testando sincronização com sistema de ML...\n')

  try {
    // Executa a sincronização (que inclui inicialização do ML)
    const result = await syncAllFeeds()
    
    console.log('✅ Sincronização concluída com sucesso!')
    console.log('📊 Resultados:')
    console.log(`   📰 Total de artigos: ${result.total_articles}`)
    console.log(`   🔗 Feeds processados: ${result.feeds_processed}`)
    console.log(`   ❌ Erros: ${result.errors.length}`)
    
    if (result.errors.length > 0) {
      console.log('\n⚠️ Erros encontrados:')
      result.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`)
      })
    }
    
    console.log('\n🎉 Teste de sincronização concluído!')
    
  } catch (error) {
    console.error('💥 Erro durante a sincronização:', error)
    process.exit(1)
  }
}

// Executa o teste
testSyncWithML()
