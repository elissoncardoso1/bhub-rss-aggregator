import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'
import { z } from 'zod'

const querySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  search: z.string().optional(),
  highlighted: z.enum(['all', 'highlighted', 'normal']).optional().default('all'),
  orderBy: z.enum(['createdAt', 'title', 'viewCount']).optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc')
})

/**
 * GET /api/admin/articles - Lista artigos para administração
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

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
    
    // Filtro de destaque
    if (query.highlighted === 'highlighted') {
      where.highlighted = true
    } else if (query.highlighted === 'normal') {
      where.highlighted = false
    }
    
    // Construir ordenação
    const orderBy: any = {}
    if (query.orderBy === 'createdAt') {
      orderBy.createdAt = query.order
    } else if (query.orderBy === 'title') {
      orderBy.title = query.order
    } else if (query.orderBy === 'viewCount') {
      orderBy.viewCount = query.order
    }
    
    // Buscar artigos e total
    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              color: true
            }
          },
          feed: {
            select: {
              id: true,
              name: true
            }
          },
          authors: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
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
      abstract: article.abstract,
      createdAt: article.createdAt,
      viewCount: Number(article.viewCount),
      originalUrl: article.originalUrl,
      highlighted: article.highlighted,
      category: article.category ? {
        id: article.category.id.toString(),
        name: article.category.name,
        color: article.category.color
      } : null,
      feed: article.feed ? {
        id: article.feed.id.toString(),
        name: article.feed.name
      } : null,
      authors: article.authors.map(a => ({
        id: a.author.id.toString(),
        name: a.author.name
      }))
    }))
    
    const totalPages = Math.ceil(total / limit)
    
    return NextResponse.json({
      articles: formattedArticles,
      pagination: {
        page,
        limit,
        total: Number(total),
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
    
  } catch (error) {
    console.error('Erro ao buscar artigos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}