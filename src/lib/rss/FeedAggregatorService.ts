import Parser from "rss-parser"
import { prisma } from "@/src/lib/prisma"
import { ArticleParserService } from "./ArticleParserService"
import { normalizeAuthorName } from "@/src/lib/text"
import { embeddingClassifier } from "@/src/lib/ml/embedClassifier"

const parser = new Parser({ 
  timeout: 30000,
  headers: {
    'User-Agent': 'bhub RSS Aggregator 1.0'
  }
})

export interface SyncResult {
  total_articles: number
  feeds_processed: number
  errors: string[]
}

export interface FeedTestResult {
  success: boolean
  items_found: number
  feed_title?: string
  feed_description?: string
  sample_items?: any[]
  error?: string
  isWorking?: boolean
  responseTime?: number
  articleCount?: number
}

export interface FeedTestSummary {
  feedId: string
  feedName: string
  feedUrl: string
  isWorking: boolean
  responseTime?: number
  articleCount?: number
  error?: string
}

export class FeedAggregatorService {
  private articleParser = new ArticleParserService()

  /**
   * Sincroniza todos os feeds ativos que precisam de atualização
   */
  async syncAllActiveFeeds(): Promise<SyncResult> {
    const oneHourAgo = new Date(Date.now() - 3600_000)
    
    const feeds = await prisma.feed.findMany({
      where: {
        isActive: true,
        OR: [
          { lastSyncAt: null },
          { lastSyncAt: { lte: oneHourAgo } }
        ],
      },
      orderBy: { lastSyncAt: 'asc' } // Prioriza feeds mais antigos
    })

    let totalArticles = 0
    const errors: string[] = []

    for (const feed of feeds) {
      try {
        console.log(`Sincronizando feed: ${feed.name}`)
        const added = await this.syncFeed(feed.id)
        totalArticles += added
        console.log(`Feed ${feed.name}: ${added} novos artigos`)
      } catch (e: any) {
        const errorMsg = `Erro no feed ${feed.name}: ${e?.message || e}`
        errors.push(errorMsg)
        console.error(errorMsg)
      }
    }

    return { 
      total_articles: totalArticles, 
      feeds_processed: feeds.length, 
      errors 
    }
  }

  /**
   * Sincroniza um feed específico
   */
  async syncFeed(feedId: bigint): Promise<number> {
    const feed = await prisma.feed.findUniqueOrThrow({ 
      where: { id: feedId } 
    })
    
    try {
      console.log(`Fazendo parse do feed: ${feed.feedUrl}`)
      const rssData = await parser.parseURL(feed.feedUrl)
      let addedCount = 0

      if (!rssData.items || rssData.items.length === 0) {
        console.log(`Feed ${feed.name} não retornou itens`)
        await this.updateFeedSuccess(feed.id)
        return 0
      }

      console.log(`Feed ${feed.name}: processando ${rssData.items.length} itens`)

      for (const item of rssData.items) {
        try {
          const parsedData = this.articleParser.parseItem(item, { 
            feedType: feed.feedType as any 
          })

          // Verifica se já existe
          const existingArticle = await prisma.article.findFirst({
            where: { 
              feedId: feed.id, 
              externalId: parsedData.externalId 
            },
            select: { id: true }
          })

          if (existingArticle) {
            continue // Já existe, pula
          }

          // Determina categoria
          const categoryId = await this.determineCategoryId(
            parsedData.title, 
            parsedData.abstract, 
            parsedData.keywords
          )

          // Cria o artigo
          const article = await prisma.article.create({
            data: {
              feedId: feed.id,
              externalId: parsedData.externalId,
              title: parsedData.title,
              abstract: parsedData.abstract || null,
              authorsRaw: JSON.stringify(parsedData.authors),
              keywordsRaw: JSON.stringify(parsedData.keywords),
              doi: parsedData.doi,
              publicationDate: parsedData.publicationDate,
              originalUrl: parsedData.url || null,
              feedEntryDate: new Date(),
              categoryId,
            },
          })

          // Processa autores
          await this.processAuthors(article.id, parsedData.authors)
          addedCount++

        } catch (itemError: any) {
          console.error(`Erro ao processar item do feed ${feed.name}:`, itemError)
          // Continue processando outros itens
        }
      }

      // Atualiza status de sucesso
      await this.updateFeedSuccess(feed.id)
      return addedCount

    } catch (error: any) {
      // Atualiza status de erro
      await this.updateFeedError(feed.id, error)
      throw error
    }
  }

  /**
   * Testa um feed sem salvar dados
   */
  async testFeed(feedUrl: string): Promise<FeedTestResult> {
    try {
      const rssData = await parser.parseURL(feedUrl)
      
      const sampleItems = rssData.items?.slice(0, 3).map(item => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate || item.isoDate,
        author: item.author || item.creator,
        categories: item.categories
      })) || []

      return {
        success: true,
        items_found: rssData.items?.length || 0,
        feed_title: rssData.title,
        feed_description: rssData.description,
        sample_items: sampleItems
      }
    } catch (error: any) {
      return {
        success: false,
        items_found: 0,
        error: error?.message || 'Erro desconhecido'
      }
    }
  }

  /**
   * Processa autores de um artigo
   */
  private async processAuthors(articleId: bigint, authors: string[]) {
    for (let i = 0; i < authors.length; i++) {
      const authorName = authors[i]
      const normalizedName = normalizeAuthorName(authorName)

      if (!normalizedName) continue

      try {
        // Busca ou cria o autor
        const author = await prisma.author.upsert({
          where: { normalizedName },
          update: { 
            name: authorName, // Atualiza com a versão mais recente do nome
            articleCount: { increment: 1 } 
          },
          create: { 
            name: authorName, 
            normalizedName,
            articleCount: 1
          },
        })

        // Cria a relação artigo-autor
        await prisma.articleAuthor.create({
          data: { 
            articleId, 
            authorId: author.id, 
            authorOrder: i + 1 
          },
        })
      } catch (authorError: any) {
        console.error(`Erro ao processar autor "${authorName}":`, authorError)
        // Continue com outros autores
      }
    }
  }

  /**
   * Determina categoria do artigo usando o novo classificador de embeddings
   */
  private async determineCategoryId(
    title: string, 
    abstract: string, 
    keywords: string[] = []
  ): Promise<bigint | null> {
    try {
      // Usa o novo classificador de embeddings
      const classification = await embeddingClassifier.classifyArticle(title, abstract, keywords)
      
      if (!classification) {
        console.log(`Artigo sem categoria específica: ${title.substring(0, 100)}`)
        return null
      }

      console.log(`Artigo classificado como "${classification.category}" com confiança ${classification.confidence.toFixed(3)}`)

      // Cria ou busca a categoria no banco
      try {
        const category = await prisma.category.upsert({
          where: { slug: classification.slug },
          update: {}, // Não atualiza se já existe
          create: { 
            name: classification.category, 
            slug: classification.slug,
            description: `Artigos relacionados a ${classification.category.toLowerCase()}`
          },
        })
        return category.id
      } catch (categoryError: any) {
        console.error(`Erro ao criar/buscar categoria "${classification.category}":`, categoryError)
        return null
      }
      
    } catch (error: any) {
      console.error(`Erro ao classificar artigo "${title.substring(0, 100)}":`, error)
      return null
    }
  }

  /**
   * Atualiza feed com sucesso
   */
  private async updateFeedSuccess(feedId: bigint) {
    await prisma.feed.update({
      where: { id: feedId },
      data: { 
        lastSyncAt: new Date(), 
        errorCount: 0, 
        lastError: null 
      },
    })
  }

  /**
   * Atualiza feed com erro
   */
  private async updateFeedError(feedId: bigint, error: any) {
    await prisma.feed.update({
      where: { id: feedId },
      data: { 
        lastSyncAt: new Date(), 
        errorCount: { increment: 1 }, 
        lastError: String(error?.message || error) 
      },
    })
  }

  /**
   * Testa a conectividade de todos os feeds ativos
   */
  async testAllFeeds(): Promise<{ working: FeedTestSummary[], broken: FeedTestSummary[] }> {
    const feeds = await prisma.feed.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })

    const working: FeedTestSummary[] = []
    const broken: FeedTestSummary[] = []

    for (const feed of feeds) {
      try {
        console.log(`Testando conectividade do feed: ${feed.name}`)
        const result = await this.testFeed(feed.feedUrl)
        
        if (result.success) {
          working.push({
            feedId: feed.id.toString(),
            feedName: feed.name,
            feedUrl: feed.feedUrl,
            isWorking: true,
            responseTime: result.responseTime,
            articleCount: result.items_found
          })
        } else {
          broken.push({
            feedId: feed.id.toString(),
            feedName: feed.name,
            feedUrl: feed.feedUrl,
            isWorking: false,
            error: result.error
          })
        }
      } catch (error: any) {
        console.error(`Erro ao testar feed ${feed.name}:`, error)
        broken.push({
          feedId: feed.id.toString(),
          feedName: feed.name,
          feedUrl: feed.feedUrl,
          isWorking: false,
          error: error?.message || 'Erro desconhecido'
        })
      }
    }

    return { working, broken }
  }
}
