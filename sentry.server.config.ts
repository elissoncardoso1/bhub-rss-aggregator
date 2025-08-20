import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Performance monitoring
  tracesSampleRate: 1.0,
  
  // Configurações de ambiente
  environment: process.env.NODE_ENV,
  
  // Configurações de contexto
  initialScope: {
    tags: {
      service: 'bhub-backend',
    },
  },
  
  // Configurações de erro
  beforeSend(event) {
    // Filtra erros específicos
    if (event.exception) {
      const errorMessage = event.exception.values?.[0]?.value || ''
      
      // Ignora erros de validação conhecidos
      if (errorMessage.includes('ValidationError') || errorMessage.includes('PrismaClientKnownRequestError')) {
        return null
      }
    }
    
    return event
  },
})
