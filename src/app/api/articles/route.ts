import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { z } from 'zod'

const querySchema = z.object({
  page: z.string().default('1'),
  limit: z.string().default('20'),
  search: z.string().optional(),
  category: z.string().optional(),
  author: z.string().optional(),
  orderBy: z.enum(['createdAt', 'publicationDate', 'viewCount', 'title']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc')
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = querySchema.parse(Object.fromEntries(searchParams))
    
    const page = parseInt(query.page)
    const limit = parseInt(query.limit)
    const skip = (page - 1) * limit
    
    // Construir filtros
    const where: any = {
      isArchived: false
    }
    
    // Filtro de busca
    if (query.search) {
      where.OR = [
        {
          title: {
            contains: query.search,
            mode: 'insensitive'
          }
        },
        {
          abstract: {
            contains: query.search,
            mode: 'insensitive'
          }
        }
      ]
    }
    
    // Filtro por categoria
    if (query.category) {
      where.category = {
        slug: query.category
      }
    }
    
    // Filtro por autor
    if (query.author) {
      where.authors = {
        some: {
          author: {
            normalizedName: {
              contains: query.author,
              mode: 'insensitive'
            }
          }
        }
      }
    }
    
    // Construir ordenação - priorizar artigos destacados
    const orderBy: any[] = [
      { highlighted: 'desc' }, // Artigos destacados primeiro
    ]
    
    if (query.orderBy === 'createdAt') {
      orderBy.push({ createdAt: query.order })
    } else if (query.orderBy === 'publicationDate') {
      orderBy.push({ publicationDate: query.order })
    } else if (query.orderBy === 'title') {
      orderBy.push({ title: query.order })
    } else if (query.orderBy === 'viewCount') {
      orderBy.push({ viewCount: query.order })
    }
    
    // Buscar artigos e total
    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        select: {
          id: true,
          title: true,
          abstract: true,
          createdAt: true,
          publicationDate: true,
          originalUrl: true,
          viewCount: true,
          highlighted: true,
          feed: {
            select: {
              name: true,
              journalName: true
            }
          },
          category: {
            select: {
              name: true,
              slug: true,
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
        orderBy,
        skip,
        take: limit
      }),
      prisma.article.count({ where })
    ])
    
    // Formatar dados
    const formattedArticles = articles.map(article => ({
      id: article.id.toString(),
      title: article.title,
      abstract: article.abstract || '',
      createdAt: article.createdAt,
      publicationDate: article.publicationDate,
      originalUrl: article.originalUrl || '',
      viewCount: article.viewCount,
      highlighted: article.highlighted,
      feedName: article.feed.name,
      journalName: article.feed.journalName,
      category: article.category ? {
        name: article.category.name,
        slug: article.category.slug,
        color: article.category.color
      } : null,
      authors: article.authors.map(a => a.author.name)
    }))
    
    const totalPages = Math.ceil(total / limit)
    
    return NextResponse.json({
      success: true,
      articles: formattedArticles,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
    
  } catch (error) {
    console.error('Erro ao buscar artigos:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor',
        articles: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      },
      { status: 500 }
    )
  }
}