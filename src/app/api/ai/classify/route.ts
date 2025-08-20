import { NextRequest, NextResponse } from "next/server"
import { textClassifier } from "@/src/lib/ai/textClassifier"
import { logInfo, logError } from "@/src/lib/logger"
import { addSecurityHeaders } from "@/src/middleware/rateLimiter"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, type, options } = body

    if (!text || typeof text !== 'string') {
      return addSecurityHeaders(NextResponse.json({
        success: false,
        message: "Texto é obrigatório e deve ser uma string"
      }, { status: 400 }))
    }

    logInfo('Solicitação de classificação de texto', { 
      type, 
      textLength: text.length,
      hasOptions: !!options 
    })

    let result: any

    switch (type) {
      case 'title':
        result = await textClassifier.classifyArticleTitle(text)
        break
      
      case 'sentiment':
        result = await textClassifier.analyzeSentiment(text)
        break
      
      case 'keywords':
        result = await textClassifier.extractKeywords(text)
        break
      
      case 'topic':
        if (!options?.candidateTopics || !Array.isArray(options.candidateTopics)) {
          return addSecurityHeaders(NextResponse.json({
            success: false,
            message: "Para classificação de tópico, candidateTopics é obrigatório"
          }, { status: 400 }))
        }
        result = await textClassifier.classifyTopic(text, options.candidateTopics)
        break
      
      default:
        return addSecurityHeaders(NextResponse.json({
          success: false,
          message: "Tipo de classificação inválido. Use: title, sentiment, keywords, ou topic"
        }, { status: 400 }))
    }

    logInfo('Classificação concluída com sucesso', { 
      type, 
      textLength: text.length,
      resultCount: Array.isArray(result) ? result.length : 1
    })

    return addSecurityHeaders(NextResponse.json({
      success: true,
      data: result,
      metadata: {
        type,
        textLength: text.length,
        timestamp: new Date().toISOString()
      }
    }))

  } catch (error: any) {
    logError('Erro na classificação de texto', error, { 
      type: 'unknown',
      textLength: 0
    })
    
    return addSecurityHeaders(NextResponse.json({
      success: false,
      message: "Erro interno do servidor",
      error: error.message
    }, { status: 500 }))
  }
}

// Endpoint para verificar disponibilidade do serviço
export async function GET() {
  try {
    const isAvailable = await textClassifier.isAvailable()
    
    return addSecurityHeaders(NextResponse.json({
      success: true,
      data: {
        available: isAvailable,
        service: 'huggingface',
        timestamp: new Date().toISOString()
      }
    }))
  } catch (error: any) {
    logError('Erro ao verificar disponibilidade do serviço de IA', error)
    
    return addSecurityHeaders(NextResponse.json({
      success: false,
      message: "Erro ao verificar disponibilidade",
      error: error.message
    }, { status: 500 }))
  }
}
