import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/src/lib/prisma"
import { checkSearchRateLimit, addSecurityHeaders } from "@/src/middleware/rateLimiter"
import { logInfo, logError, logDebug, logWarn } from "@/src/lib/logger"

export async function GET(request: NextRequest) {
  try {
    // Aplica rate limiting
    const rateLimitResponse = await checkSearchRateLimit(request)
    if (rateLimitResponse) {
      logWarn('Rate limit excedido para sugestões de busca', { 
        ip: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') 
      })
      return addSecurityHeaders(rateLimitResponse)
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")?.trim()
    
    logDebug('Buscando sugestões', { query, ip: request.ip || 'unknown' })
    
    if (!query || query.length < 2) {
      return addSecurityHeaders(NextResponse.json({
        success: true,
        data: {
          articles: [],
          authors: [],
          categories: []
        }
      }))
    }

    const searchTerm = `%${query}%`

    // Busca paralela por artigos, autores e categorias
    const [articles, authors, categories] = await Promise.all([
      // Artigos por título
      prisma.article.findMany({
        where: {
          title: {
            contains: query,
            mode: 'insensitive'
          },
          isArchived: false
        },
        select: {
          id: true,
          title: true,
          publicationDate: true,
          category: {
            select: {
              name: true,
              color: true
            }
          }
        },
        orderBy: { publicationDate: 'desc' },
        take: 5
      }),

      // Autores
      prisma.author.findMany({
        where: {
          name: {
            contains: query,
            mode: 'insensitive'
          }
        },
        select: {
          id: true,
          name: true,
          articleCount: true
        },
        orderBy: { articleCount: 'desc' },
        take: 5
      }),

      // Categorias
      prisma.category.findMany({
        where: {
          name: {
            contains: query,
            mode: 'insensitive'
          }
        },
        select: {
          id: true,
          name: true,
          slug: true,
          color: true,
          _count: {
            select: {
              articles: {
                where: { isArchived: false }
              }
            }
          }
        },
        orderBy: {
          articles: {
            _count: 'desc'
          }
        },
        take: 3
      })
    ])

    const suggestions = {
      articles: articles.map(article => ({
        id: article.id.toString(),
        title: article.title,
        publicationDate: article.publicationDate,
        category: article.category
      })),
      authors: authors.map(author => ({
        id: author.id.toString(),
        name: author.name,
        articleCount: author.articleCount
      })),
      categories: categories.map(category => ({
        id: category.id.toString(),
        name: category.name,
        slug: category.slug,
        color: category.color,
        articleCount: category._count.articles
      }))
    }

    logInfo('Sugestões de busca retornadas', { 
      query, 
      results: {
        articles: suggestions.articles.length,
        authors: suggestions.authors.length,
        categories: suggestions.categories.length
      }
    })

    return addSecurityHeaders(NextResponse.json({
      success: true,
      data: suggestions
    }))

  } catch (error: any) {
    logError('Erro ao buscar sugestões', error, { 
      query: new URL(request.url).searchParams.get("q"),
      ip: request.ip || 'unknown'
    })
    
    return addSecurityHeaders(NextResponse.json({
      success: false,
      message: "Erro interno do servidor",
      error: error.message
    }, { status: 500 }))
  }
}
