import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/src/lib/prisma"
import { withAdmin, apiSuccess, apiError } from "@/src/lib/api-auth"
import { z } from "zod"

// Schema de validação para criar/editar feed
const feedSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  journalName: z.string().min(1, "Nome do jornal é obrigatório"),
  feedUrl: z.string().url("URL do feed deve ser válida"),
  feedType: z.enum(["RSS", "RSS2", "ATOM"]).default("RSS"),
  country: z.string().optional(),
  language: z.string().default("pt-BR"),
  isActive: z.boolean().default(true),
  syncFrequency: z.number().min(300).default(3600) // Mínimo 5 minutos
})

/**
 * GET /api/admin/feeds - Lista todos os feeds
 */
export const GET = withAdmin(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const isActive = searchParams.get("isActive")
    
    const skip = (page - 1) * limit
    
    const where = isActive !== null ? { 
      isActive: isActive === "true" 
    } : {}

    const [feeds, total] = await Promise.all([
      prisma.feed.findMany({
        where,
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
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.feed.count({ where })
    ])

    const formattedFeeds = feeds.map(feed => ({
      ...feed,
      id: feed.id.toString(),
      articleCount: feed._count.articles
    }))

    return apiSuccess({
      feeds: formattedFeeds,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error: any) {
    console.error("Erro ao listar feeds:", error)
    return apiError("Erro interno do servidor", 500, error)
  }
})

/**
 * POST /api/admin/feeds - Cria um novo feed
 */
export const POST = withAdmin(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const validatedData = feedSchema.parse(body)

    // Verifica se já existe um feed com essa URL
    const existingFeed = await prisma.feed.findUnique({
      where: { feedUrl: validatedData.feedUrl }
    })

    if (existingFeed) {
      return apiError("Já existe um feed com essa URL", 409)
    }

    const newFeed = await prisma.feed.create({
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
        syncFrequency: true,
        createdAt: true
      }
    })

    return apiSuccess({
      ...newFeed,
      id: newFeed.id.toString()
    }, "Feed criado com sucesso")

  } catch (error: any) {
    console.error("Erro ao criar feed:", error)
    
    if (error instanceof z.ZodError) {
      return apiError("Dados inválidos", 400, error.errors)
    }
    
    return apiError("Erro interno do servidor", 500, error)
  }
})
