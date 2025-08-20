import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance monitoring
  tracesSampleRate: 1.0,
  
  // Session replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Configurações de ambiente
  environment: process.env.NODE_ENV,
  
  // Ignorar erros específicos
  beforeSend(event) {
    // Ignora erros de rede em desenvolvimento
    if (process.env.NODE_ENV === 'development' && event.exception) {
      return null
    }
    return event
  },
  
  // Configurações de contexto
  initialScope: {
    tags: {
      service: 'bhub-frontend',
    },
  },
})
