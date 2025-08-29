import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const articleId = BigInt(id)
    
    // Buscar artigo atual
    const currentArticle = await prisma.article.findUnique({
      where: { id: articleId },
      select: { highlighted: true }
    })

    if (!currentArticle) {
      return NextResponse.json(
        { error: 'Artigo não encontrado' },
        { status: 404 }
      )
    }

    // Alternar o status de destaque
    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data: {
        highlighted: !currentArticle.highlighted
      },
      include: {
        feed: true,
        category: true
      }
    })

    return NextResponse.json({ 
      article: {
        ...updatedArticle,
        id: updatedArticle.id.toString(),
        feedId: updatedArticle.feedId.toString(),
        categoryId: updatedArticle.categoryId?.toString(),
        feed: updatedArticle.feed ? {
          ...updatedArticle.feed,
          id: updatedArticle.feed.id.toString()
        } : null,
        category: updatedArticle.category ? {
          ...updatedArticle.category,
          id: updatedArticle.category.id.toString()
        } : null
      }
    })
  } catch (error) {
    console.error('Erro ao alternar destaque do artigo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}