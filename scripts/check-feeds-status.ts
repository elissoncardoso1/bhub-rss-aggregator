import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkFeedsStatus() {
  try {
    console.log('🔍 Verificando status dos feeds no banco de dados...')
    console.log('')

    const feeds = await prisma.feed.findMany({
      select: {
        id: true,
        name: true,
        isActive: true,
        lastSyncAt: true,
        errorCount: true,
        lastError: true,
        createdAt: true,
        _count: {
          select: {
            articles: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    console.log(`📊 Total de feeds encontrados: ${feeds.length}`)
    console.log('')

    feeds.forEach((feed, index) => {
      const status = feed.isActive ? '✅ Ativo' : '❌ Inativo'
      const lastSync = feed.lastSyncAt ? 
        `🕒 ${feed.lastSyncAt.toLocaleString('pt-BR')}` : 
        '⚠️  NUNCA SINCRONIZADO (null)'
      const articles = `📄 ${feed._count.articles} artigos`
      const errors = feed.errorCount > 0 ? 
        `❌ ${feed.errorCount} erros` : 
        '✅ Sem erros'

      console.log(`${index + 1}. ${feed.name}`)
      console.log(`   ${status} | ${lastSync}`)
      console.log(`   ${articles} | ${errors}`)
      
      if (feed.lastError) {
        console.log(`   🚨 Último erro: ${feed.lastError}`)
      }
      
      console.log(`   📅 Criado em: ${feed.createdAt.toLocaleString('pt-BR')}`)
      console.log('')
    })

    // Estatísticas gerais
    const activeFeeds = feeds.filter(f => f.isActive).length
    const syncedFeeds = feeds.filter(f => f.lastSyncAt !== null).length
    const feedsWithErrors = feeds.filter(f => f.errorCount > 0).length
    const totalArticles = feeds.reduce((sum, f) => sum + f._count.articles, 0)

    console.log('📈 Resumo:')
    console.log(`   • Feeds ativos: ${activeFeeds}/${feeds.length}`)
    console.log(`   • Feeds já sincronizados: ${syncedFeeds}/${feeds.length}`)
    console.log(`   • Feeds com erros: ${feedsWithErrors}/${feeds.length}`)
    console.log(`   • Total de artigos: ${totalArticles}`)
    console.log('')

    if (syncedFeeds === 0) {
      console.log('🚨 PROBLEMA IDENTIFICADO:')
      console.log('   Nenhum feed foi sincronizado ainda (todos com lastSyncAt = null)')
      console.log('')
      console.log('💡 Possíveis soluções:')
      console.log('   1. Execute: npm run db:sync')
      console.log('   2. Ou via API: curl -X POST http://localhost:3000/api/admin/sync-all')
      console.log('   3. Verifique se o servidor está rodando corretamente')
    }

  } catch (error: any) {
    console.error('❌ Erro ao verificar feeds:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkFeedsStatus()