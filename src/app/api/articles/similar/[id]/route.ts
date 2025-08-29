import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/src/lib/prisma"
import { getFromCache, setInCache, generateSimilarArticlesKey } from "@/src/lib/rss/cache"
import { logInfo, logError, logDebug, logWarn } from "@/src/lib/logger"

interface Context {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: Context) {
  const { id } = await params
  const articleId = BigInt(id)
  const cacheKey = generateSimilarArticlesKey(id)
  
  try {
    
    logInfo('Buscando artigos similares', { articleId: id, cacheKey })

    // Tenta obter do cache primeiro
    const cachedResult = getFromCache(cacheKey)
    if (cachedResult) {
      logDebug('Resultado obtido do cache', { cacheKey })
      return NextResponse.json(cachedResult)
    }

    logDebug('Cache miss, buscando no banco de dados', { articleId: id })

    // Busca o artigo original
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: {
        id: true,
        title: true,
        categoryId: true,
        keywordsRaw: true,
        authors: {
          select: {
            author: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    if (!article) {
      logWarn('Artigo não encontrado', { articleId: id })
      return NextResponse.json({
        success: false,
        message: "Artigo não encontrado"
      }, { status: 404 })
    }

    // Estratégias para encontrar artigos similares:
    // 1. Mesma categoria
    // 2. Autores em comum
    // 3. Palavras-chave similares

    const authorIds = article.authors.map(a => a.author.id)
    const keywords = article.keywordsRaw ? JSON.parse(article.keywordsRaw) : []

    logDebug('Buscando artigos similares', { 
      articleId: id, 
      categoryId: article.categoryId, 
      authorCount: authorIds.length,
      keywordCount: keywords.length 
    })

    // Busca artigos similares
    const similarArticles = await prisma.article.findMany({
      where: {
        AND: [
          { id: { not: articleId } }, // Exclui o artigo atual
          { isArchived: false },
          {
            OR: [
              // Mesma categoria
              article.categoryId ? { categoryId: article.categoryId } : {},
              
              // Autores em comum
              authorIds.length > 0 ? {
                authors: {
                  some: {
                    authorId: { in: authorIds }
                  }
                }
              } : {},
              
              // Título com palavras similares (busca simples)
              {
                title: {
                  contains: article.title.split(' ').slice(0, 3).join(' '),
                  mode: 'insensitive'
                }
              }
            ]
          }
        ]
      },
      select: {
        id: true,
        title: true,
        abstract: true,
        publicationDate: true,
        originalUrl: true,
        viewCount: true,
        feed: {
          select: {
            name: true,
            journalName: true
          }
        },
        category: {
          select: {
            name: true,
            color: true
          }
        },
        authors: {
          select: {
            author: {
              select: {
                name: true
              }
            },
            authorOrder: true
          },
          orderBy: { authorOrder: 'asc' },
          take: 3
        }
      },
      orderBy: [
        { publicationDate: 'desc' },
        { viewCount: 'desc' }
      ],
      take: 6
    })

    const formattedArticles = similarArticles.map(similar => ({
      id: similar.id.toString(),
      title: similar.title,
      abstract: similar.abstract,
      publicationDate: similar.publicationDate,
      originalUrl: similar.originalUrl,
      viewCount: similar.viewCount,
      feedName: similar.feed.name,
      journalName: similar.feed.journalName,
      category: similar.category,
      authors: similar.authors.map(a => a.author.name)
    }))

    const result = {
      success: true,
      data: {
        similar: formattedArticles,
        total: formattedArticles.length
      }
    }

    logInfo('Artigos similares encontrados', { 
      articleId: id, 
      similarCount: formattedArticles.length,
      cacheKey 
    })

    // Armazena no cache por 15 minutos
    setInCache(cacheKey, result, 1000 * 60 * 15)
    logDebug('Resultado armazenado no cache', { cacheKey, ttl: '15min' })

    return NextResponse.json(result)

  } catch (error: any) {
    logError('Erro ao buscar artigos similares', error, { articleId: id })
    return NextResponse.json({
      success: false,
      message: "Erro interno do servidor",
      error: error.message
    }, { status: 500 })
  }
}
