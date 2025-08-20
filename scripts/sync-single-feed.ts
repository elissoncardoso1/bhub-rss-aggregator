import { PrismaClient } from '@prisma/client'
import { FeedAggregatorService } from '../src/lib/rss/FeedAggregatorService'

const prisma = new PrismaClient()

async function syncSingleFeed() {
  try {
    console.log('🔄 Iniciando sincronização de feed único...')
    
    // Buscar um feed ativo
    const feed = await prisma.feed.findFirst({
      where: { isActive: true }
    })
    
    if (!feed) {
      console.log('❌ Nenhum feed ativo encontrado')
      return
    }
    
    console.log(`📡 Sincronizando feed: ${feed.name}`)
    console.log(`🔗 URL: ${feed.feedUrl}`)
    
    // Criar serviço de agregação
    const aggregator = new FeedAggregatorService()
    
    // Sincronizar o feed
    const result = await aggregator.syncFeed(feed.id)
    
    console.log('✅ Sincronização concluída!')
    console.log(`📊 Resultado: ${result} artigos processados`)
    
  } catch (error: any) {
    console.error('❌ Erro durante sincronização:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

syncSingleFeed()
