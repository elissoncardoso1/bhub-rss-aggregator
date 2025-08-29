import { NextRequest, NextResponse } from "next/server"
import { withAdmin, apiSuccess, apiError } from "@/src/lib/api-auth"
import { prisma } from "@/src/lib/prisma"

/**
 * GET /api/admin/stats - Estatísticas administrativas
 */
export const GET = withAdmin(async (request: NextRequest) => {
  try {
    // Estatísticas básicas
    const [
      totalArticles,
      totalFeeds,
      activeFeeds,
      totalAuthors,
      articlesToday,
      recentArticles
    ] = await Promise.all([
      // Total de artigos não arquivados
      prisma.article.count({
        where: { isArchived: false }
      }),
      
      // Total de feeds
      prisma.feed.count(),
      
      // Feeds ativos
      prisma.feed.count({
        where: { isActive: true }
      }),
      
      // Total de autores
      prisma.author.count(),
      
      // Artigos adicionados hoje
      prisma.article.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          },
          isArchived: false
        }
      }),
      
      // Artigos recentes
      prisma.article.findMany({
        where: { isArchived: false },
        select: {
          id: true,
          title: true,
          abstract: true,
          createdAt: true,
          originalUrl: true,
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
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      })
    ])

    const stats = {
      totals: {
        articles: totalArticles,
        feeds: totalFeeds,
        activeFeeds,
        authors: totalAuthors
      },
      today: {
        articles: articlesToday
      },
      recentArticles: recentArticles.map(article => ({
        id: article.id.toString(),
        title: article.title,
        abstract: article.abstract || '',
        createdAt: article.createdAt,
        originalUrl: article.originalUrl || '',
        feedName: article.feed.name,
        journalName: article.feed.journalName,
        category: article.category ? {
          name: article.category.name,
          color: article.category.color
        } : null
      }))
    }

    return apiSuccess(stats)

  } catch (error: any) {
    console.error("Erro ao buscar estatísticas administrativas:", error)
    return apiError("Erro interno do servidor", 500, error)
  }
})