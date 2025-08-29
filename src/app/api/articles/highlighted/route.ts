import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '5')

    const highlightedArticles = await prisma.article.findMany({
      where: {
        isArchived: false,
        highlighted: true
      },
      select: {
        id: true,
        title: true,
        abstract: true,
        createdAt: true,
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
        { createdAt: 'desc' }
      ],
      take: limit
    })

    const formattedArticles = highlightedArticles.map(article => ({
      id: article.id.toString(),
      title: article.title,
      abstract: article.abstract || '',
      createdAt: article.createdAt,
      originalUrl: article.originalUrl || '',
      viewCount: article.viewCount,
      highlighted: article.highlighted,
      feedName: article.feed.name,
      journalName: article.feed.journalName,
      category: article.category ? {
        name: article.category.name,
        color: article.category.color
      } : null,
      authors: article.authors.map((a: { author: { name: string } }) => a.author.name)
    }))

    return NextResponse.json({
      success: true,
      articles: formattedArticles,
      total: formattedArticles.length
    })

  } catch (error) {
    console.error('Erro ao buscar artigos destacados:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor',
        articles: [],
        total: 0
      },
      { status: 500 }
    )
  }
}