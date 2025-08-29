import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ position: string }> }
) {
  try {
    const { position: positionParam } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '1')
    
    const position = positionParam.toUpperCase() as 'HEADER' | 'SIDEBAR' | 'BETWEEN_ARTICLES' | 'FOOTER'
    
    const now = new Date()
    
    const banners = await prisma.banner.findMany({
      where: {
        position,
        isActive: true,
        OR: [
          { startDate: null },
          { startDate: { lte: now } }
        ],
        AND: [
          {
            OR: [
              { endDate: null },
              { endDate: { gte: now } }
            ]
          }
        ]
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit
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