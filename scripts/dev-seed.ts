import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Limpa dados existentes
  console.log('🧹 Limpando dados existentes...')
  await prisma.articleAuthor.deleteMany()
  await prisma.article.deleteMany()
  await prisma.author.deleteMany()
  await prisma.category.deleteMany()
  await prisma.feed.deleteMany()
  await prisma.user.deleteMany()

  // Cria usuário admin
  console.log('👤 Criando usuário administrador...')
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@bhub.com',
      name: 'Administrador bhub',
      password: adminPassword,
      role: 'ADMIN'
    }
  })
  console.log(`✅ Admin criado: ${admin.email}`)

  // Cria categorias
  console.log('📂 Criando categorias...')
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Terapia Comportamental',
        slug: 'terapia-comportamental',
        description: 'Artigos sobre intervenções terapêuticas baseadas em ABA',
        color: '#3B82F6'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Análise Experimental',
        slug: 'analise-experimental',
        description: 'Pesquisas experimentais em análise do comportamento',
        color: '#10B981'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Educação',
        slug: 'educacao',
        description: 'Aplicações educacionais da análise do comportamento',
        color: '#F59E0B'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Clínica',
        slug: 'clinica',
        description: 'Aplicações clínicas e terapêuticas',
        color: '#EF4444'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Organizacional',
        slug: 'organizacional',
        description: 'Comportamento organizacional e gestão',
        color: '#8B5CF6'
      }
    })
  ])
  console.log(`✅ ${categories.length} categorias criadas`)

  // Cria feeds de exemplo
  console.log('📡 Criando feeds RSS de exemplo...')
  const feeds = await Promise.all([
    prisma.feed.create({
      data: {
        name: 'Journal of Applied Behavior Analysis',
        journalName: 'Journal of Applied Behavior Analysis',
        feedUrl: 'https://onlinelibrary.wiley.com/action/showFeed?jc=15327966&type=etoc&feed=rss',
        feedType: 'RSS',
        country: 'US',
        language: 'en',
        isActive: true,
        syncFrequency: 3600
      }
    }),
    prisma.feed.create({
      data: {
        name: 'Behavior Analysis in Practice',
        journalName: 'Behavior Analysis in Practice',
        feedUrl: 'https://link.springer.com/search.rss?facet-content-type=Article&facet-journal-id=40617&channel-name=Behavior%20Analysis%20in%20Practice',
        feedType: 'RSS',
        country: 'US',
        language: 'en',
        isActive: true,
        syncFrequency: 3600
      }
    }),
    prisma.feed.create({
      data: {
        name: 'Revista Brasileira de Análise do Comportamento',
        journalName: 'Revista Brasileira de Análise do Comportamento',
        feedUrl: 'https://periodicos.ufpa.br/index.php/rebac/gateway/plugin/WebFeedGatewayPlugin/rss',
        feedType: 'RSS',
        country: 'BR',
        language: 'pt-BR',
        isActive: true,
        syncFrequency: 3600
      }
    }),
    prisma.feed.create({
      data: {
        name: 'Perspectivas em Análise do Comportamento',
        journalName: 'Perspectivas em Análise do Comportamento',
        feedUrl: 'https://revistaperspectivas.org/perspectivas/gateway/plugin/WebFeedGatewayPlugin/rss',
        feedType: 'RSS',
        country: 'BR',
        language: 'pt-BR',
        isActive: true,
        syncFrequency: 3600
      }
    }),
    prisma.feed.create({
      data: {
        name: 'The Behavior Analyst',
        journalName: 'The Behavior Analyst',
        feedUrl: 'https://link.springer.com/search.rss?facet-content-type=Article&facet-journal-id=40614&channel-name=The%20Behavior%20Analyst',
        feedType: 'RSS',
        country: 'US',
        language: 'en',
        isActive: true,
        syncFrequency: 3600
      }
    })
  ])
  console.log(`✅ ${feeds.length} feeds criados`)

  // Cria alguns autores de exemplo
  console.log('👥 Criando autores de exemplo...')
  const authors = await Promise.all([
    prisma.author.create({
      data: {
        name: 'Brian A. Iwata',
        normalizedName: 'brian a iwata',
        articleCount: 0
      }
    }),
    prisma.author.create({
      data: {
        name: 'Dorothea C. Lerman',
        normalizedName: 'dorothea c lerman',
        articleCount: 0
      }
    }),
    prisma.author.create({
      data: {
        name: 'Timothy R. Vollmer',
        normalizedName: 'timothy r vollmer',
        articleCount: 0
      }
    }),
    prisma.author.create({
      data: {
        name: 'João Claudio Todorov',
        normalizedName: 'joao claudio todorov',
        articleCount: 0
      }
    }),
    prisma.author.create({
      data: {
        name: 'Maria Martha Costa Hübner',
        normalizedName: 'maria martha costa hubner',
        articleCount: 0
      }
    })
  ])
  console.log(`✅ ${authors.length} autores criados`)

  // Cria alguns artigos de exemplo
  console.log('📄 Criando artigos de exemplo...')
  const sampleArticles = [
    {
      title: 'Functional Analysis of Problem Behavior: A Review',
      abstract: 'This article provides a comprehensive review of functional analysis procedures used to identify the environmental determinants of problem behavior. The review covers methodological considerations, applications, and future directions in the field.',
      feedId: feeds[0].id,
      categoryId: categories[1].id, // Análise Experimental
      authorIds: [authors[0].id, authors[1].id],
      keywords: ['functional analysis', 'problem behavior', 'assessment', 'methodology'],
      doi: '10.1002/jaba.123',
      publicationDate: new Date('2024-01-15')
    },
    {
      title: 'Teaching Social Skills to Children with Autism: A Behavioral Approach',
      abstract: 'This study examines the effectiveness of behavioral interventions in teaching social skills to children with autism spectrum disorders. Results demonstrate significant improvements in social interaction and communication.',
      feedId: feeds[1].id,
      categoryId: categories[0].id, // Terapia Comportamental
      authorIds: [authors[2].id],
      keywords: ['autism', 'social skills', 'behavioral intervention', 'children'],
      publicationDate: new Date('2024-01-20')
    },
    {
      title: 'Análise Comportamental Aplicada na Educação: Princípios e Práticas',
      abstract: 'Este artigo discute a aplicação dos princípios da análise do comportamento no contexto educacional, apresentando estratégias eficazes para o ensino e manejo comportamental em sala de aula.',
      feedId: feeds[2].id,
      categoryId: categories[2].id, // Educação
      authorIds: [authors[3].id, authors[4].id],
      keywords: ['educação', 'análise do comportamento', 'ensino', 'sala de aula'],
      publicationDate: new Date('2024-01-25')
    },
    {
      title: 'Behavioral Economics and Consumer Choice: An Analysis of Decision-Making',
      abstract: 'This research explores how behavioral economic principles can explain consumer decision-making processes, with implications for marketing and policy development.',
      feedId: feeds[4].id,
      categoryId: categories[4].id, // Organizacional
      authorIds: [authors[0].id],
      keywords: ['behavioral economics', 'consumer choice', 'decision making', 'marketing'],
      doi: '10.1007/s40614-024-00123-4',
      publicationDate: new Date('2024-02-01')
    },
    {
      title: 'Intervenções Comportamentais em Saúde Mental: Uma Revisão Sistemática',
      abstract: 'Revisão sistemática das intervenções comportamentais utilizadas no tratamento de transtornos de saúde mental, analisando eficácia e aplicabilidade clínica.',
      feedId: feeds[3].id,
      categoryId: categories[3].id, // Clínica
      authorIds: [authors[4].id],
      keywords: ['saúde mental', 'intervenções comportamentais', 'revisão sistemática', 'clínica'],
      publicationDate: new Date('2024-02-05')
    }
  ]

  for (const articleData of sampleArticles) {
    const article = await prisma.article.create({
      data: {
        feedId: articleData.feedId,
        externalId: `sample-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: articleData.title,
        abstract: articleData.abstract,
        authorsRaw: JSON.stringify(articleData.authorIds.map(id => 
          authors.find(a => a.id === id)?.name
        ).filter(Boolean)),
        keywordsRaw: JSON.stringify(articleData.keywords),
        doi: articleData.doi || null,
        publicationDate: articleData.publicationDate,
        originalUrl: `https://example.com/article/${articleData.title.toLowerCase().replace(/\s+/g, '-')}`,
        feedEntryDate: new Date(),
        categoryId: articleData.categoryId,
        viewCount: Math.floor(Math.random() * 100)
      }
    })

    // Cria relações autor-artigo
    for (let i = 0; i < articleData.authorIds.length; i++) {
      await prisma.articleAuthor.create({
        data: {
          articleId: article.id,
          authorId: articleData.authorIds[i],
          authorOrder: i + 1
        }
      })

      // Atualiza contador de artigos do autor
      await prisma.author.update({
        where: { id: articleData.authorIds[i] },
        data: { articleCount: { increment: 1 } }
      })
    }
  }
  console.log(`✅ ${sampleArticles.length} artigos criados`)

  console.log('🎉 Seed concluído com sucesso!')
  console.log('')
  console.log('📊 Resumo:')
  console.log(`  - 1 usuário admin (admin@bhub.com / admin123)`)
  console.log(`  - ${categories.length} categorias`)
  console.log(`  - ${feeds.length} feeds RSS`)
  console.log(`  - ${authors.length} autores`)
  console.log(`  - ${sampleArticles.length} artigos`)
  console.log('')
  console.log('🚀 Você pode agora:')
  console.log('  - Fazer login como admin@bhub.com / admin123')
  console.log('  - Explorar o repositório com dados de exemplo')
  console.log('  - Testar a sincronização de feeds')
  console.log('  - Adicionar novos feeds RSS')
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
