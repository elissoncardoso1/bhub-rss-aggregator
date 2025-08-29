import { NextRequest, NextResponse } from "next/server"
import { withAdmin, apiSuccess, apiError } from "@/src/lib/api-auth"
// import { cleanRepository, archiveOldArticles } from "@/src/jobs/cleanRepository" // DESABILITADO
import { z } from "zod"

const cleanSchema = z.object({
  action: z.enum(["delete", "archive"]).default("delete"),
  daysToKeep: z.number().min(30).max(3650).default(365) // Entre 30 dias e 10 anos
})

/**
 * POST /api/admin/repository/clean - Limpa ou arquiva artigos antigos (DESABILITADO)
 * 
 * NOTA: Sistema configurado como REPOSITÓRIO DE CONSULTA
 * - Artigos antigos são preservados para consulta histórica
 * - Não há limpeza automática de conteúdo
 * - Foco em preservar o acervo científico
 */
export const POST = withAdmin(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { action, daysToKeep } = cleanSchema.parse(body)

    console.log(`🚫 Tentativa de ${action} de artigos (DESABILITADO - Sistema de consulta)`)

    // Retorna informação sobre o sistema de consulta
    return apiSuccess({
      status: "disabled",
      reason: "Sistema configurado como repositório de consulta",
      requestedAction: action,
      requestedDaysToKeep: daysToKeep,
      message: "Artigos antigos são preservados para consulta histórica",
      processedAt: new Date().toISOString(),
      recommendation: "Use o sistema de arquivamento se necessário, mas preserve o conteúdo"
    }, `Sistema de limpeza desabilitado - Foco em preservar o acervo científico`)

  } catch (error: any) {
    console.error("Erro no endpoint de limpeza:", error)
    
    if (error instanceof z.ZodError) {
      return apiError("Parâmetros inválidos", 400, error.errors)
    }
    
    return apiError("Erro no endpoint de limpeza", 500, error)
  }
})
