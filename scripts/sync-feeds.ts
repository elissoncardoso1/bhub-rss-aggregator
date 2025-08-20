import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Iniciando sincronização de todos os feeds...')

  try {
    // Buscar todos os feeds ativos
    const activeFeeds = await prisma.feed.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })

    console.log(`📡 Encontrados ${activeFeeds.length} feeds ativos para sincronização:`)
    activeFeeds.forEach(feed => {
      console.log(`  - ${feed.name} (${feed.country || 'N/A'}) - ${feed.feedUrl}`)
    })

    console.log('')
    console.log('🚀 Para sincronizar os feeds, execute um dos comandos abaixo:')
    console.log('')
    console.log('Via API (recomendado):')
    console.log('  curl -X POST http://localhost:3000/api/admin/sync-all')
    console.log('')
    console.log('Via painel administrativo:')
    console.log('  1. Acesse http://localhost:3000/admin')
    console.log('  2. Faça login como admin@bhub.com / admin123')
    console.log('  3. Clique em "Sincronizar Todos os Feeds"')
    console.log('')
    console.log('Via cron job (automático):')
    console.log('  curl -X POST http://localhost:3000/api/cron/sync')
    console.log('')

    // Verificar se há artigos já sincronizados
    const totalArticles = await prisma.article.count()
    const recentArticles = await prisma.article.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // últimas 24 horas
        }
      }
    })

    console.log('📊 Status atual do repositório:')
    console.log(`  - Total de artigos: ${totalArticles}`)
    console.log(`  - Artigos das últimas 24h: ${recentArticles}`)
    console.log('')

    if (totalArticles === 0) {
      console.log('💡 Dica: Como não há artigos no repositório ainda, execute a sincronização')
      console.log('   para começar a popular o banco de dados com conteúdo real.')
    }

    // Mostrar feeds por país/idioma
    const feedsByCountry = activeFeeds.reduce((acc, feed) => {
      const country = feed.country || 'Unknown'
      if (!acc[country]) acc[country] = []
      acc[country].push(feed)
      return acc
    }, {} as Record<string, typeof activeFeeds>)

    console.log('🌍 Feeds por país/região:')
    Object.entries(feedsByCountry).forEach(([country, feeds]) => {
      const flag = country === 'BR' ? '🇧🇷' : country === 'US' ? '🇺🇸' : '🌐'
      console.log(`  ${flag} ${country}: ${feeds.length} feeds`)
      feeds.forEach(feed => {
        console.log(`    - ${feed.journalName}`)
      })
    })

  } catch (error) {
    console.error('❌ Erro ao verificar feeds:', error)
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
