import { NextRequest, NextResponse } from "next/server"
import { withAdmin, apiSuccess, apiError } from "@/src/lib/api-auth"
import { cleanRepository, archiveOldArticles } from "@/src/jobs/cleanRepository"
import { z } from "zod"

const cleanSchema = z.object({
  action: z.enum(["delete", "archive"]).default("delete"),
  daysToKeep: z.number().min(30).max(3650).default(365) // Entre 30 dias e 10 anos
})

/**
 * POST /api/admin/repository/clean - Limpa ou arquiva artigos antigos
 */
export const POST = withAdmin(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { action, daysToKeep } = cleanSchema.parse(body)

    console.log(`Iniciando ${action} de artigos com mais de ${daysToKeep} dias`)

    let result

    if (action === "archive") {
      result = await archiveOldArticles(daysToKeep)
      return apiSuccess({
        action: "archive",
        daysToKeep,
        archivedArticles: result.archivedArticles,
        processedAt: new Date().toISOString()
      }, `${result.archivedArticles} artigos foram arquivados com sucesso.`)
    } else {
      result = await cleanRepository(daysToKeep)
      return apiSuccess({
        action: "delete",
        daysToKeep,
        deletedArticles: result.deletedArticles,
        deletedAuthors: result.deletedAuthors,
        cutoffDate: 'cutoffDate' in result ? result.cutoffDate : undefined,
        processedAt: new Date().toISOString()
      }, `${result.deletedArticles} artigos e ${result.deletedAuthors} autores órfãos foram removidos.`)
    }

  } catch (error: any) {
    console.error("Erro na limpeza do repositório:", error)
    
    if (error instanceof z.ZodError) {
      return apiError("Parâmetros inválidos", 400, error.errors)
    }
    
    return apiError("Erro ao limpar repositório", 500, error)
  }
})
