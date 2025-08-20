import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/src/lib/prisma"
import { withAdmin, apiSuccess, apiError } from "@/src/lib/api-auth"
import { z } from "zod"

interface Context {
  params: {
    id: string
  }
}

// Schema de validação para editar feed
const updateFeedSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").optional(),
  journalName: z.string().min(1, "Nome do jornal é obrigatório").optional(),
  feedUrl: z.string().url("URL do feed deve ser válida").optional(),
  feedType: z.enum(["RSS", "RSS2", "ATOM"]).optional(),
  country: z.string().optional(),
  language: z.string().optional(),
  isActive: z.boolean().optional(),
  syncFrequency: z.number().min(300).optional() // Mínimo 5 minutos
})

/**
 * GET /api/admin/feeds/[id] - Busca um feed específico
 */
export const GET = withAdmin(async (request: NextRequest, { params }: Context) => {
  try {
    const feedId = BigInt(params.id)

    const feed = await prisma.feed.findUnique({
      where: { id: feedId },
      select: {
        id: true,
        name: true,
        journalName: true,
        feedUrl: true,
        feedType: true,
        country: true,
        language: true,
        isActive: true,
        lastSyncAt: true,
        syncFrequency: true,
        errorCount: true,
        lastError: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            articles: {
              where: { isArchived: false }
            }
          }
        }
      }
    })

    if (!feed) {
      return apiError("Feed não encontrado", 404)
    }

    return apiSuccess({
      ...feed,
      id: feed.id.toString(),
      articleCount: feed._count.articles
    })

  } catch (error: any) {
    console.error("Erro ao buscar feed:", error)
    return apiError("Erro interno do servidor", 500, error)
  }
})

/**
 * PATCH /api/admin/feeds/[id] - Atualiza um feed
 */
export const PATCH = withAdmin(async (request: NextRequest, { params }: Context) => {
  try {
    const feedId = BigInt(params.id)
    const body = await request.json()
    const validatedData = updateFeedSchema.parse(body)

    // Verifica se o feed existe
    const existingFeed = await prisma.feed.findUnique({
      where: { id: feedId }
    })

    if (!existingFeed) {
      return apiError("Feed não encontrado", 404)
    }

    // Se está alterando a URL, verifica duplicata
    if (validatedData.feedUrl && validatedData.feedUrl !== existingFeed.feedUrl) {
      const duplicateFeed = await prisma.feed.findUnique({
        where: { feedUrl: validatedData.feedUrl }
      })

      if (duplicateFeed) {
        return apiError("Já existe um feed com essa URL", 409)
      }
    }

    const updatedFeed = await prisma.feed.update({
      where: { id: feedId },
      data: validatedData,
      select: {
        id: true,
        name: true,
        journalName: true,
        feedUrl: true,
        feedType: true,
        country: true,
        language: true,
        isActive: true,
        lastSyncAt: true,
        syncFrequency: true,
        errorCount: true,
        lastError: true,
        updatedAt: true
      }
    })

    return apiSuccess({
      ...updatedFeed,
      id: updatedFeed.id.toString()
    }, "Feed atualizado com sucesso")

  } catch (error: any) {
    console.error("Erro ao atualizar feed:", error)
    
    if (error instanceof z.ZodError) {
      return apiError("Dados inválidos", 400, error.errors)
    }
    
    return apiError("Erro interno do servidor", 500, error)
  }
})

/**
 * DELETE /api/admin/feeds/[id] - Remove um feed
 */
export const DELETE = withAdmin(async (request: NextRequest, { params }: Context) => {
  try {
    const feedId = BigInt(params.id)

    // Verifica se o feed existe
    const existingFeed = await prisma.feed.findUnique({
      where: { id: feedId },
      select: {
        id: true,
        name: true,
        _count: {
          select: { articles: true }
        }
      }
    })

    if (!existingFeed) {
      return apiError("Feed não encontrado", 404)
    }

    // Remove todos os artigos e relações do feed
    await prisma.$transaction(async (tx) => {
      // Remove relações ArticleAuthor dos artigos deste feed
      await tx.articleAuthor.deleteMany({
        where: {
          article: {
            feedId: feedId
          }
        }
      })

      // Remove artigos do feed
      await tx.article.deleteMany({
        where: { feedId: feedId }
      })

      // Remove o feed
      await tx.feed.delete({
        where: { id: feedId }
      })
    })

    return apiSuccess(
      {
        id: feedId.toString(),
        name: existingFeed.name,
        articlesRemoved: existingFeed._count.articles
      },
      "Feed removido com sucesso"
    )

  } catch (error: any) {
    console.error("Erro ao remover feed:", error)
    return apiError("Erro interno do servidor", 500, error)
  }
})
