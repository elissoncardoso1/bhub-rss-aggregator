import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'
import { z } from 'zod'

// 🔴 Schema de validação para feeds
const FeedSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  journalName: z.string().min(1, 'Nome do jornal é obrigatório').max(200, 'Nome do jornal muito longo'),
  feedUrl: z.string().url('URL do feed inválida'),
  feedType: z.enum(['RSS', 'RSS2', 'ATOM'], {
    errorMap: () => ({ message: 'Tipo de feed inválido' })
  }).optional(),
  country: z.string().length(2, 'País deve ter 2 caracteres').optional().or(z.literal('')),
  language: z.string().min(2, 'Idioma deve ter pelo menos 2 caracteres').max(10, 'Idioma muito longo').optional(),
  isActive: z.boolean().optional(),
  syncFrequency: z.number().int().min(300, 'Frequência mínima é 5 minutos').max(86400, 'Frequência máxima é 24 horas').optional()
})

// GET - Listar todos os feeds
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const feeds = await prisma.feed.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ feeds })
  } catch (error) {
    console.error('Erro ao buscar feeds:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo feed
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const rawData = await request.json()
    
    // 🔴 VALIDAR DADOS ANTES DE PROCESSAR
    const validationResult = FeedSchema.safeParse(rawData)
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Dados inválidos', 
        details: validationResult.error.errors 
      }, { status: 400 })
    }
    
    const data = validationResult.data
    
    // Verificar se o feed já existe
    const existingFeed = await prisma.feed.findUnique({
      where: { feedUrl: data.feedUrl }
    })
    
    if (existingFeed) {
      return NextResponse.json({ 
        error: 'Feed com esta URL já existe' 
      }, { status: 409 })
    }
    
    const feed = await prisma.feed.create({
      data: {
        name: data.name,
        journalName: data.journalName,
        feedUrl: data.feedUrl,
        feedType: data.feedType || 'RSS',
        country: data.country || null,
        language: data.language || 'pt-BR',
        isActive: data.isActive ?? true,
        syncFrequency: data.syncFrequency || 3600
      }
    })

    return NextResponse.json({ feed }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar feed:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
