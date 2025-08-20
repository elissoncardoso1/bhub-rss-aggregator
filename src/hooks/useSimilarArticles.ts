import { useQuery } from '@tanstack/react-query'

interface SimilarArticle {
  id: string
  title: string
  abstract?: string | null
  publicationDate?: string | null
  originalUrl?: string | null
  viewCount?: number
  feedName: string
  journalName: string
  category?: {
    name: string
    color: string
  } | null
  authors: string[]
}

interface SimilarArticlesResponse {
  success: boolean
  data: {
    similar: SimilarArticle[]
    total: number
  }
}

async function fetchSimilarArticles(articleId: string): Promise<SimilarArticlesResponse> {
  const response = await fetch(`/api/articles/similar/${articleId}`)
  if (!response.ok) {
    throw new Error('Falha ao buscar artigos similares')
  }
  return response.json()
}

export function useSimilarArticles(articleId: string) {
  return useQuery({
    queryKey: ['similar-articles', articleId],
    queryFn: () => fetchSimilarArticles(articleId),
    enabled: !!articleId,
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
    retry: (failureCount, error) => {
      // Não tenta novamente em caso de erro 404
      if (error instanceof Error && error.message.includes('404')) {
        return false
      }
      return failureCount < 2
    },
  })
}
