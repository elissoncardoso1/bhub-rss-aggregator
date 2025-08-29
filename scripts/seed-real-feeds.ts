import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Preparando feeds reais de revistas em Análise do Comportamento...')

  // Verifica conexão com o banco
  try {
    await prisma.$connect()
    console.log('✅ Conectado ao banco de dados')
  } catch (error) {
    console.log('⚠️  Banco de dados não disponível, listando feeds que seriam adicionados...')
    console.log('')
    listFeedsOnly()
    return
  }
  
  // Primeiro, vamos limpar feeds existentes para evitar duplicatas
  try {
    console.log('🧹 Removendo feeds de exemplo...')
    await prisma.feed.deleteMany({
      where: {
        OR: [
          { name: { contains: 'Journal of Applied Behavior Analysis' } },
          { name: { contains: 'Behavior Analysis in Practice' } },
          { name: { contains: 'Revista Brasileira de Análise do Comportamento' } },
          { name: { contains: 'Perspectivas em Análise do Comportamento' } },
          { name: { contains: 'The Behavior Analyst' } }
        ]
      }
    })
    console.log('✅ Feeds de exemplo removidos')
  } catch (error: any) {
    console.log('⚠️  Erro ao remover feeds de exemplo:', error.message)
  }

  // Feeds em Português (Brasil)
  console.log('🇧🇷 Adicionando feeds brasileiros...')
  const brazilianFeeds = [
    {
      name: 'Revista Perspectivas em Análise do Comportamento',
      journalName: 'Revista Perspectivas em Análise do Comportamento',
      feedUrl: 'https://revistaperspectivas.org/perspectivas/gateway/plugin/WebFeedGatewayPlugin/rss2',
      feedType: 'RSS' as const,
      country: 'BR',
      language: 'pt-BR',
      description: 'Behaviorismo Radical / ABA'
    },
    {
      name: 'Revista ESPECTRO (UFSCar)',
      journalName: 'Revista ESPECTRO',
      feedUrl: 'https://www.espectro.ufscar.br/index.php/1979/gateway/plugin/WebFeedGatewayPlugin/rss2',
      feedType: 'RSS2' as const,
      country: 'BR',
      language: 'pt-BR',
      description: 'ABA (Autismo)'
    },
    {
      name: 'Boletim Contexto (ABPMC)',
      journalName: 'Boletim Contexto',
      feedUrl: 'https://boletimcontexto.wordpress.com/feed',
      feedType: 'RSS' as const,
      country: 'BR',
      language: 'pt-BR',
      description: 'Análise do Comportamento (informativo)'
    },
    {
      name: 'Portal Comporte-se',
      journalName: 'Portal Comporte-se',
      feedUrl: 'https://comportese.com/feed',
      feedType: 'RSS' as const,
      country: 'BR',
      language: 'pt-BR',
      description: 'Análise do Comportamento (divulgação)'
    }
  ]

  for (const feedData of brazilianFeeds) {
    try {
      const feed = await prisma.feed.create({
        data: {
          name: feedData.name,
          journalName: feedData.journalName,
          feedUrl: feedData.feedUrl,
          feedType: feedData.feedType,
          country: feedData.country,
          language: feedData.language,
          isActive: true,
          syncFrequency: 3600 // 1 hora
        }
      })
      console.log(`✅ Feed brasileiro criado: ${feed.name}`)
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(`⚠️  Feed já existe: ${feedData.name}`)
      } else {
        console.error(`❌ Erro ao criar feed ${feedData.name}:`, error.message)
      }
    }
  }

  // Feeds em Inglês (Internacional)
  console.log('🇺🇸 Adicionando feeds internacionais...')
  const internationalFeeds = [
    {
      name: 'Journal of Applied Behavior Analysis (JABA)',
      journalName: 'Journal of Applied Behavior Analysis',
      feedUrl: 'https://onlinelibrary.wiley.com/rss/journal/10.1002/(ISSN)1938-3703',
      feedType: 'RSS' as const,
      country: 'US',
      language: 'en',
      description: 'ABA (experimental aplicada)'
    },
    {
      name: 'Journal of the Experimental Analysis of Behavior (JEAB)',
      journalName: 'Journal of the Experimental Analysis of Behavior',
      feedUrl: 'https://onlinelibrary.wiley.com/rss/journal/10.1002/(ISSN)1938-3711',
      feedType: 'RSS' as const,
      country: 'US',
      language: 'en',
      description: 'Análise Experimental do Comportamento'
    },
    {
      name: 'Journal of Organizational Behavior Management (JOBM)',
      journalName: 'Journal of Organizational Behavior Management',
      feedUrl: 'https://www.tandfonline.com/feed/rss/worg20',
      feedType: 'RSS' as const,
      country: 'US',
      language: 'en',
      description: 'OBM (Organizational Behavior Management)'
    },
    {
      name: 'Behavior Analysis in Practice (BAP)',
      journalName: 'Behavior Analysis in Practice',
      feedUrl: 'https://link.springer.com/search.rss?facet-journal-id=40617&facet-content-type=Article',
      feedType: 'RSS' as const,
      country: 'US',
      language: 'en',
      description: 'ABA (prática clínica)'
    },
    {
      name: 'Perspectives on Behavior Science',
      journalName: 'Perspectives on Behavior Science',
      feedUrl: 'https://link.springer.com/search.rss?facet-journal-id=40614&facet-content-type=Article',
      feedType: 'RSS' as const,
      country: 'US',
      language: 'en',
      description: 'Teoria e Revisões'
    },
    {
      name: 'The Analysis of Verbal Behavior (TAVB)',
      journalName: 'The Analysis of Verbal Behavior',
      feedUrl: 'https://link.springer.com/search.rss?facet-journal-id=40616&facet-content-type=Article',
      feedType: 'RSS' as const,
      country: 'US',
      language: 'en',
      description: 'Comportamento Verbal'
    },
    {
      name: 'Behavior and Social Issues (BSI)',
      journalName: 'Behavior and Social Issues',
      feedUrl: 'https://link.springer.com/search.rss?facet-journal-id=42822&facet-content-type=Article',
      feedType: 'RSS' as const,
      country: 'US',
      language: 'en',
      description: 'ABA e questões sociais'
    },
    {
      name: 'OBM Network News (Newsletter)',
      journalName: 'OBM Network News',
      feedUrl: 'http://www.obmnetwork.com/resource/rss/news.rss',
      feedType: 'RSS' as const,
      country: 'US',
      language: 'en',
      description: 'OBM (informativo institucional)'
    }
  ]

  for (const feedData of internationalFeeds) {
    try {
      const feed = await prisma.feed.create({
        data: {
          name: feedData.name,
          journalName: feedData.journalName,
          feedUrl: feedData.feedUrl,
          feedType: feedData.feedType,
          country: feedData.country,
          language: feedData.language,
          isActive: true,
          syncFrequency: 3600 // 1 hora
        }
      })
      console.log(`✅ Feed internacional criado: ${feed.name}`)
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(`⚠️  Feed já existe: ${feedData.name}`)
      } else {
        console.error(`❌ Erro ao criar feed ${feedData.name}:`, error.message)
      }
    }
  }

  // Atualizar categorias com cores do tema jornal
  console.log('🎨 Atualizando cores das categorias...')
  await prisma.category.updateMany({
    where: { slug: 'terapia-comportamental' },
    data: { color: '#DC2626' } // Red-600
  })
  await prisma.category.updateMany({
    where: { slug: 'analise-experimental' },
    data: { color: '#EA580C' } // Orange-600
  })
  await prisma.category.updateMany({
    where: { slug: 'educacao' },
    data: { color: '#CA8A04' } // Yellow-600
  })
  await prisma.category.updateMany({
    where: { slug: 'clinica' },
    data: { color: '#DC2626' } // Red-600
  })
  await prisma.category.updateMany({
    where: { slug: 'organizacional' },
    data: { color: '#7C3AED' } // Violet-600
  })

  // Adicionar algumas categorias específicas para os feeds
  console.log('📂 Adicionando categorias específicas...')
  const newCategories = [
    {
      name: 'Comportamento Verbal',
      slug: 'comportamento-verbal',
      description: 'Análise do comportamento verbal e linguagem',
      color: '#059669' // Emerald-600
    },
    {
      name: 'Questões Sociais',
      slug: 'questoes-sociais',
      description: 'Aplicações da ABA em questões sociais e comunitárias',
      color: '#2563EB' // Blue-600
    },
    {
      name: 'Autismo',
      slug: 'autismo',
      description: 'Intervenções comportamentais para transtorno do espectro autista',
      color: '#DB2777' // Pink-600
    },
    {
      name: 'Filosofia Behaviorista',
      slug: 'filosofia-behaviorista',
      description: 'Fundamentos filosóficos da análise do comportamento',
      color: '#7C2D12' // Amber-800
    }
  ]

  for (const categoryData of newCategories) {
    try {
      const category = await prisma.category.create({
        data: categoryData
      })
      console.log(`✅ Categoria criada: ${category.name}`)
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(`⚠️  Categoria já existe: ${categoryData.name}`)
      } else {
        console.error(`❌ Erro ao criar categoria ${categoryData.name}:`, error.message)
      }
    }
  }

  // Estatísticas finais
  const totalFeeds = await prisma.feed.count()
  const totalCategories = await prisma.category.count()
  const activeFeeds = await prisma.feed.count({ where: { isActive: true } })

  console.log('')
  console.log('🎉 Feeds reais adicionados com sucesso!')
  console.log('')
  console.log('📊 Resumo final:')
  console.log(`  - ${totalFeeds} feeds totais (${activeFeeds} ativos)`)
  console.log(`  - ${brazilianFeeds.length} feeds brasileiros`)
  console.log(`  - ${internationalFeeds.length} feeds internacionais`)
  console.log(`  - ${totalCategories} categorias`)
  console.log('')
  console.log('🚀 Próximos passos:')
  console.log('  - Execute a sincronização de feeds para buscar artigos')
  console.log('  - Monitore os feeds no painel administrativo')
  console.log('  - Configure a sincronização automática via cron jobs')
  console.log('')
  console.log('📡 Feeds adicionados:')
  console.log('  🇧🇷 Brasileiros:')
  brazilianFeeds.forEach(feed => console.log(`    - ${feed.name}`))
  console.log('  🇺🇸 Internacionais:')
  internationalFeeds.forEach(feed => console.log(`    - ${feed.name}`))
}

function listFeedsOnly() {
  // Feeds em Português (Brasil)
  const brazilianFeeds = [
    {
      name: 'Revista Perspectivas em Análise do Comportamento',
      journalName: 'Revista Perspectivas em Análise do Comportamento',
      feedUrl: 'https://revistaperspectivas.org/perspectivas/gateway/plugin/WebFeedGatewayPlugin/rss2',
      feedType: 'RSS' as const,
      country: 'BR',
      language: 'pt-BR',
      description: 'Behaviorismo Radical / ABA'
    },
    {
      name: 'Revista ESPECTRO (UFSCar)',
      journalName: 'Revista ESPECTRO',
      feedUrl: 'https://www.espectro.ufscar.br/index.php/1979/gateway/plugin/WebFeedGatewayPlugin/rss2',
      feedType: 'RSS2' as const,
      country: 'BR',
      language: 'pt-BR',
      description: 'ABA (Autismo)'
    },
    {
      name: 'Boletim Contexto (ABPMC)',
      journalName: 'Boletim Contexto',
      feedUrl: 'https://boletimcontexto.wordpress.com/feed',
      feedType: 'RSS' as const,
      country: 'BR',
      language: 'pt-BR',
      description: 'Análise do Comportamento (informativo)'
    },
    {
      name: 'Portal Comporte-se',
      journalName: 'Portal Comporte-se',
      feedUrl: 'https://comportese.com/feed',
      feedType: 'RSS' as const,
      country: 'BR',
      language: 'pt-BR',
      description: 'Análise do Comportamento (divulgação)'
    }
  ]

  // Feeds em Inglês (Internacional)
  const internationalFeeds = [
    {
      name: 'Journal of Applied Behavior Analysis (JABA)',
      journalName: 'Journal of Applied Behavior Analysis',
      feedUrl: 'https://onlinelibrary.wiley.com/rss/journal/10.1002/(ISSN)1938-3703',
      feedType: 'RSS' as const,
      country: 'US',
      language: 'en',
      description: 'ABA (experimental aplicada)'
    },
    {
      name: 'Journal of the Experimental Analysis of Behavior (JEAB)',
      journalName: 'Journal of the Experimental Analysis of Behavior',
      feedUrl: 'https://onlinelibrary.wiley.com/rss/journal/10.1002/(ISSN)1938-3711',
      feedType: 'RSS' as const,
      country: 'US',
      language: 'en',
      description: 'Análise Experimental do Comportamento'
    },
    {
      name: 'Journal of Organizational Behavior Management (JOBM)',
      journalName: 'Journal of Organizational Behavior Management',
      feedUrl: 'https://www.tandfonline.com/feed/rss/worg20',
      feedType: 'RSS' as const,
      country: 'US',
      language: 'en',
      description: 'OBM (Organizational Behavior Management)'
    },
    {
      name: 'Behavior Analysis in Practice (BAP)',
      journalName: 'Behavior Analysis in Practice',
      feedUrl: 'https://link.springer.com/search.rss?facet-journal-id=40617&facet-content-type=Article',
      feedType: 'RSS' as const,
      country: 'US',
      language: 'en',
      description: 'ABA (prática clínica)'
    },
    {
      name: 'Perspectives on Behavior Science',
      journalName: 'Perspectives on Behavior Science',
      feedUrl: 'https://link.springer.com/search.rss?facet-journal-id=40614&facet-content-type=Article',
      feedType: 'RSS' as const,
      country: 'US',
      language: 'en',
      description: 'Teoria e Revisões'
    },
    {
      name: 'The Analysis of Verbal Behavior (TAVB)',
      journalName: 'The Analysis of Verbal Behavior',
      feedUrl: 'https://link.springer.com/search.rss?facet-journal-id=40616&facet-content-type=Article',
      feedType: 'RSS' as const,
      country: 'US',
      language: 'en',
      description: 'Comportamento Verbal'
    },
    {
      name: 'Behavior and Social Issues (BSI)',
      journalName: 'Behavior and Social Issues',
      feedUrl: 'https://link.springer.com/search.rss?facet-journal-id=42822&facet-content-type=Article',
      feedType: 'RSS' as const,
      country: 'US',
      language: 'en',
      description: 'ABA e questões sociais'
    },
    {
      name: 'OBM Network News (Newsletter)',
      journalName: 'OBM Network News',
      feedUrl: 'http://www.obmnetwork.com/resource/rss/news.rss',
      feedType: 'RSS' as const,
      country: 'US',
      language: 'en',
      description: 'OBM (informativo institucional)'
    }
  ]

  console.log('🎉 Lista de feeds reais que serão adicionados quando o banco estiver disponível!')
  console.log('')
  console.log('📊 Resumo:')
  console.log(`  - ${brazilianFeeds.length + internationalFeeds.length} feeds totais`)
  console.log(`  - ${brazilianFeeds.length} feeds brasileiros`)
  console.log(`  - ${internationalFeeds.length} feeds internacionais`)
  console.log('')
  console.log('📡 Feeds preparados:')
  console.log('  🇧🇷 Brasileiros:')
  brazilianFeeds.forEach(feed => {
    console.log(`    ✅ ${feed.name}`)
    console.log(`       📡 ${feed.feedUrl}`)
    console.log(`       📝 ${feed.description}`)
    console.log('')
  })
  console.log('  🇺🇸 Internacionais:')
  internationalFeeds.forEach(feed => {
    console.log(`    ✅ ${feed.name}`)
    console.log(`       📡 ${feed.feedUrl}`)
    console.log(`       📝 ${feed.description}`)
    console.log('')
  })
  
  console.log('🚀 Para adicionar os feeds ao banco:')
  console.log('  1. Configure sua DATABASE_URL no arquivo .env')
  console.log('  2. Execute: npm run db:push')
  console.log('  3. Execute: npm run db:seed-feeds')
  console.log('  4. Execute: npm run db:sync (para sincronizar os artigos)')
}

main()
  .catch((e) => {
    console.error('❌ Erro durante a adição de feeds:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
