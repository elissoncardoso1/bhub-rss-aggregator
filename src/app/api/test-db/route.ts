import { NextResponse } from "next/server"
import { prisma } from "@/src/lib/prisma"

export async function GET() {
  try {
    // Teste simples de conexão
    const articleCount = await prisma.article.count()
    const articleCountNotArchived = await prisma.article.count({
      where: { isArchived: false }
    })
    
    // Teste com consulta simples
    const allArticles = await prisma.article.findMany({
      take: 5,
      select: {
        id: true,
        title: true
      }
    })

    return NextResponse.json({
      success: true,
      totalArticles: articleCount,
      totalArticlesNotArchived: articleCountNotArchived,
      sampleArticles: allArticles.map(article => ({
        id: article.id.toString(),
        title: article.title
      }))
    })

  } catch (error: any) {
    console.error("Erro no teste do banco:", error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
