import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/src/lib/auth.config'
import { prisma } from '@/src/lib/prisma.client'
import { z } from 'zod'

// 🔴 Schema de validação para banners
const BannerSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(100, 'Título muito longo'),
  imageUrl: z.string().url('URL da imagem inválida').optional().or(z.literal('')),
  linkUrl: z.string().url('URL do link inválida').optional().or(z.literal('')),
  htmlContent: z.string().max(10000, 'Conteúdo HTML muito longo').optional().or(z.literal('')),
  position: z.enum(['HEADER', 'SIDEBAR', 'BETWEEN_ARTICLES', 'FOOTER'], {
    errorMap: () => ({ message: 'Posição inválida' })
  }),
  isActive: z.boolean().optional(),
  priority: z.number().int().min(0, 'Prioridade deve ser >= 0').max(100, 'Prioridade deve ser <= 100').optional(),
  startDate: z.string().datetime('Data de início inválida').optional().or(z.literal('')),
  endDate: z.string().datetime('Data de fim inválida').optional().or(z.literal(''))
})

// GET - Listar todos os banners
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const banners = await prisma.banner.findMany({
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({ banners })
  } catch (error) {
    console.error('Erro ao buscar banners:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo banner
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const rawData = await request.json()
    
    // 🔴 VALIDAR DADOS ANTES DE PROCESSAR
    const validationResult = BannerSchema.safeParse(rawData)
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Dados inválidos', 
        details: validationResult.error.errors 
      }, { status: 400 })
    }
    
    const data = validationResult.data
    
    // Processar datas
    const bannerData = {
      title: data.title,
      imageUrl: data.imageUrl || null,
      linkUrl: data.linkUrl || null,
      htmlContent: data.htmlContent || null,
      position: data.position,
      isActive: data.isActive ?? true,
      priority: data.priority ?? 0,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null
    }
    
    const banner = await prisma.banner.create({
      data: bannerData
    })

    return NextResponse.json({ banner }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar banner:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}