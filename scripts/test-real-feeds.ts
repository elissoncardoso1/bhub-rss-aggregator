#!/usr/bin/env tsx

import { FeedAggregatorService } from '../src/lib/rss/FeedAggregatorService'

/**
 * Script para testar os feeds reais sem precisar do banco de dados
 */
async function testRealFeeds() {
  console.log('🧪 Testando feeds reais de revistas de Análise do Comportamento...\n')

  // Lista de feeds para testar
  const feedsToTest = [
    {
      name: 'Revista Perspectivas em Análise do Comportamento',
      url: 'https://revistaperspectivas.org/perspectivas/gateway/plugin/WebFeedGatewayPlugin/rss2',
      country: '🇧🇷'
    },
    {
      name: 'Revista ESPECTRO (UFSCar)',
      url: 'https://www.espectro.ufscar.br/index.php/1979/gateway/plugin/WebFeedGatewayPlugin/rss2',
      country: '🇧🇷'
    },
    {
      name: 'Boletim Contexto (ABPMC)',
      url: 'https://boletimcontexto.wordpress.com/feed',
      country: '🇧🇷'
    },
    {
      name: 'Portal Comporte-se',
      url: 'https://comportese.com/feed',
      country: '🇧🇷'
    },
    {
      name: 'Journal of Applied Behavior Analysis (JABA)',
      url: 'https://onlinelibrary.wiley.com/rss/journal/10.1002/(ISSN)1938-3703',
      country: '🇺🇸'
    },
    {
      name: 'Journal of the Experimental Analysis of Behavior (JEAB)',
      url: 'https://onlinelibrary.wiley.com/rss/journal/10.1002/(ISSN)1938-3711',
      country: '🇺🇸'
    },
    {
      name: 'Behavior Analysis in Practice (BAP)',
      url: 'https://link.springer.com/search.rss?facet-journal-id=40617&facet-content-type=Article',
      country: '🇺🇸'
    },
    {
      name: 'Perspectives on Behavior Science',
      url: 'https://link.springer.com/search.rss?facet-journal-id=40614&facet-content-type=Article',
      country: '🇺🇸'
    },
    {
      name: 'OBM Network News (Newsletter)',
      url: 'http://www.obmnetwork.com/resource/rss/news.rss',
      country: '🇺🇸'
    },
    {
      name: 'Journal of Organizational Behavior Management (JOBM)',
      url: 'https://www.tandfonline.com/feed/rss/worg20',
      country: '🇺🇸'
    }
  ]

  const aggregator = new FeedAggregatorService()
  let successCount = 0
  let errorCount = 0

  console.log(`📡 Testando ${feedsToTest.length} feeds...\n`)

  for (let i = 0; i < feedsToTest.length; i++) {
    const feed = feedsToTest[i]
    console.log(`${i + 1}/${feedsToTest.length} ${feed.country} ${feed.name}`)
    console.log(`   🔗 ${feed.url}`)

    try {
      const result = await aggregator.testFeed(feed.url)
      
      if (result.success) {
        successCount++
        console.log(`   ✅ Sucesso! ${result.items_found} itens encontrados`)
        if (result.feed_title) {
          console.log(`   📰 Título: ${result.feed_title}`)
        }
        if (result.sample_items && result.sample_items.length > 0) {
          console.log(`   📄 Exemplo de artigo: ${result.sample_items[0].title?.substring(0, 80)}...`)
        }
      } else {
        errorCount++
        console.log(`   ❌ Erro: ${result.error}`)
      }
    } catch (error) {
      errorCount++
      console.log(`   💥 Erro inesperado: ${error}`)
    }
    
    console.log('')
  }

  // Resumo final
  console.log('📊 Resumo dos testes:')
  console.log(`   ✅ Sucessos: ${successCount}/${feedsToTest.length}`)
  console.log(`   ❌ Erros: ${errorCount}/${feedsToTest.length}`)
  console.log(`   📈 Taxa de sucesso: ${((successCount / feedsToTest.length) * 100).toFixed(1)}%`)
  
  if (successCount > 0) {
    console.log('\n🎉 Feeds testados com sucesso! O sistema está pronto para sincronizar artigos reais.')
    console.log('   Para usar os feeds:')
    console.log('   1. Configure o banco de dados (.env)')
    console.log('   2. Execute: npm run db:seed-feeds')
    console.log('   3. Execute: npm run db:sync')
  } else {
    console.log('\n⚠️  Nenhum feed funcionou. Verifique sua conexão com a internet.')
  }
}

// Executa o teste
testRealFeeds().catch(error => {
  console.error('💥 Erro durante o teste:', error)
  process.exit(1)
})
