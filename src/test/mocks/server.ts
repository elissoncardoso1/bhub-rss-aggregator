import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

// Mock da API de artigos similares
export const handlers = [
  http.get('/api/articles/similar/:id', ({ params }) => {
    const { id } = params
    
    // Mock de dados de artigos similares
    const mockSimilarArticles = {
      success: true,
      data: {
        similar: [
          {
            id: '2',
            title: 'Artigo Similar 1',
            abstract: 'Este é um artigo similar ao artigo original',
            publicationDate: '2024-01-15T00:00:00.000Z',
            originalUrl: 'https://example.com/article1',
            viewCount: 150,
            feedName: 'Journal of Applied Behavior Analysis',
            journalName: 'JABA',
            category: {
              name: 'Análise do Comportamento',
              color: '#ef4444'
            },
            authors: ['João Silva', 'Maria Santos']
          },
          {
            id: '3',
            title: 'Artigo Similar 2',
            abstract: 'Outro artigo relacionado ao tema',
            publicationDate: '2024-01-10T00:00:00.000Z',
            originalUrl: 'https://example.com/article2',
            viewCount: 120,
            feedName: 'Behavior Analysis in Practice',
            journalName: 'BAP',
            category: {
              name: 'Prática Clínica',
              color: '#3b82f6'
            },
            authors: ['Pedro Costa']
          }
        ],
        total: 2
      }
    }

    return HttpResponse.json(mockSimilarArticles)
  }),

  // Mock para outras APIs se necessário
  http.get('/api/stats', () => {
    return HttpResponse.json({
      success: true,
      data: {
        totalArticles: 1000,
        totalFeeds: 25,
        totalViews: 50000
      }
    })
  })
]

export const server = setupServer(...handlers)
