import { prisma } from "@/src/lib/prisma"

/**
 * Job para limpeza do repositório
 * Remove artigos não arquivados com mais de 365 dias
 */
export async function cleanRepository(daysToKeep: number = 365) {
  console.log(`🧹 Iniciando limpeza do repositório (mantendo ${daysToKeep} dias)...`)
  
  const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000)
  
  try {
    // Primeiro, remove as relações ArticleAuthor dos artigos que serão deletados
    const articlesToDelete = await prisma.article.findMany({
      where: {
        createdAt: { lt: cutoffDate },
        isArchived: false
      },
      select: { id: true }
    })
    
    const articleIds = articlesToDelete.map(a => a.id)
    
    if (articleIds.length === 0) {
      console.log("✅ Nenhum artigo para limpar")
      return { deletedArticles: 0, deletedAuthors: 0 }
    }
    
    console.log(`📊 Encontrados ${articleIds.length} artigos para remoção`)
    
    // Remove relações ArticleAuthor
    const deletedRelations = await prisma.articleAuthor.deleteMany({
      where: {
        articleId: { in: articleIds }
      }
    })
    
    console.log(`🔗 Removidas ${deletedRelations.count} relações artigo-autor`)
    
    // Remove os artigos
    const deletedArticles = await prisma.article.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        isArchived: false
      }
    })
    
    console.log(`📄 Removidos ${deletedArticles.count} artigos`)
    
    // Remove autores órfãos (sem artigos)
    const deletedAuthors = await prisma.author.deleteMany({
      where: {
        articleCount: { lte: 0 }
      }
    })
    
    // Atualiza contadores de artigos dos autores restantes
    await prisma.$executeRaw`
      UPDATE "Author" 
      SET "articleCount" = (
        SELECT COUNT(*) 
        FROM "ArticleAuthor" 
        WHERE "ArticleAuthor"."authorId" = "Author"."id"
      )
    `
    
    console.log(`👥 Removidos ${deletedAuthors.count} autores órfãos`)
    
    const result = {
      deletedArticles: deletedArticles.count,
      deletedAuthors: deletedAuthors.count,
      cutoffDate: cutoffDate.toISOString()
    }
    
    console.log("✅ Limpeza concluída:", result)
    return result
    
  } catch (error) {
    console.error("💥 Erro durante limpeza:", error)
    throw error
  }
}

/**
 * Arquiva artigos antigos em vez de deletá-los
 */
export async function archiveOldArticles(daysToKeep: number = 365) {
  console.log(`📦 Arquivando artigos com mais de ${daysToKeep} dias...`)
  
  const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000)
  
  try {
    const archivedArticles = await prisma.article.updateMany({
      where: {
        createdAt: { lt: cutoffDate },
        isArchived: false
      },
      data: {
        isArchived: true
      }
    })
    
    console.log(`📦 Arquivados ${archivedArticles.count} artigos`)
    return { archivedArticles: archivedArticles.count }
    
  } catch (error) {
    console.error("💥 Erro durante arquivamento:", error)
    throw error
  }
}
