import { PrismaClient } from '@prisma/client'
import { FeedAggregatorService } from '../src/lib/rss/FeedAggregatorService'

const prisma = new PrismaClient()

async function forceSyncFeeds() {
  try {
    console.log('🔄 Forçando sincronização de todos os feeds...')
    console.log('')

    // Buscar todos os feeds ativos
    const activeFeeds = await prisma.feed.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        feedUrl: true,
        lastSyncAt: true
      },
      orderBy: { name: 'asc' }
    })

    console.log(`📡 Encontrados ${activeFeeds.length} feeds ativos`)
    console.log('')

    const aggregator = new FeedAggregatorService()
    let totalArticles = 0
    let successCount = 0
    let errorCount = 0

    for (const feed of activeFeeds) {
      try {
        console.log(`🔄 Sincronizando: ${feed.name}`)
        console.log(`   URL: ${feed.feedUrl}`)
        console.log(`   Último sync: ${feed.lastSyncAt ? feed.lastSyncAt.toLocaleString('pt-BR') : 'NUNCA'}`)
        
        const articlesAdded = await aggregator.syncFeed(feed.id)
        totalArticles += articlesAdded
        successCount++
        
        console.log(`   ✅ Sucesso: ${articlesAdded} novos artigos`)
        
        // Verificar se o lastSyncAt foi atualizado
        const updatedFeed = await prisma.feed.findUnique({
          where: { id: feed.id },
          select: { lastSyncAt: true }
        })
        
        console.log(`   🕒 Novo lastSyncAt: ${updatedFeed?.lastSyncAt ? updatedFeed.lastSyncAt.toLocaleString('pt-BR') : 'AINDA NULL!'}`)
        console.log('')
        
      } catch (error: any) {
        errorCount++
        console.log(`   ❌ Erro: ${error.message}`)
        console.log('')
      }
    }

    console.log('📊 Resumo da sincronização:')
    console.log(`   • Feeds processados: ${activeFeeds.length}`)
    console.log(`   • Sucessos: ${successCount}`)
    console.log(`   • Erros: ${errorCount}`)
    console.log(`   • Total de novos artigos: ${totalArticles}`)
    console.log('')

    // Verificar status final dos feeds
    console.log('🔍 Verificando status final dos feeds...')
    const finalFeeds = await prisma.feed.findMany({
      where: { isActive: true },
      select: {
        name: true,
        lastSyncAt: true
      },
      orderBy: { name: 'asc' }
    })

    const syncedFeeds = finalFeeds.filter(f => f.lastSyncAt !== null)
    const nullFeeds = finalFeeds.filter(f => f.lastSyncAt === null)

    console.log(`✅ Feeds com lastSyncAt atualizado: ${syncedFeeds.length}/${finalFeeds.length}`)
    if (nullFeeds.length > 0) {
      console.log(`⚠️  Feeds ainda com lastSyncAt null: ${nullFeeds.length}`)
      nullFeeds.forEach(feed => {
        console.log(`   - ${feed.name}`)
      })
    }

  } catch (error: any) {
    console.error('❌ Erro durante sincronização forçada:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

forceSyncFeeds()