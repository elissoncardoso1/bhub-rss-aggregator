import { LRUCache } from 'lru-cache'

// Interface para o cache de RSS
interface RSSCacheItem {
  content: any
  timestamp: number
  ttl: number
}

// Configuração do cache LRU
const rssCache = new LRUCache<string, RSSCacheItem>({
  max: 500, // Máximo de 500 itens no cache
  ttl: 1000 * 60 * 30, // TTL padrão de 30 minutos
  updateAgeOnGet: true, // Atualiza a idade quando acessado
  allowStale: true, // Permite retornar dados expirados se necessário
  noDisposeOnSet: true, // Não chama dispose ao definir
})

// Função para obter item do cache
export function getFromCache<T>(key: string): T | null {
  const item = rssCache.get(key)
  if (!item) return null

  // Verifica se o item ainda é válido
  const now = Date.now()
  if (now - item.timestamp > item.ttl) {
    rssCache.delete(key)
    return null
  }

  return item.content as T
}

// Função para definir item no cache
export function setInCache<T>(key: string, content: T, ttl: number = 1000 * 60 * 30): void {
  const item: RSSCacheItem = {
    content,
    timestamp: Date.now(),
    ttl,
  }
  rssCache.set(key, item)
}

// Função para invalidar cache por padrão
export function invalidateCacheByPattern(pattern: string): void {
  const keys = Array.from(rssCache.keys())
  keys.forEach(key => {
    if (key.includes(pattern)) {
      rssCache.delete(key)
    }
  })
}

// Função para limpar todo o cache
export function clearCache(): void {
  rssCache.clear()
}

// Função para obter estatísticas do cache
export function getCacheStats() {
  return {
    size: rssCache.size,
    max: rssCache.max,
    ttl: rssCache.ttl,
    hasDispose: !!rssCache.dispose,
    noDisposeOnSet: rssCache.noDisposeOnSet,
  }
}

// Função para gerar chave de cache para RSS feed
export function generateRSSKey(feedUrl: string, lastModified?: string): string {
  return `rss:${feedUrl}:${lastModified || 'default'}`
}

// Função para gerar chave de cache para artigos similares
export function generateSimilarArticlesKey(articleId: string): string {
  return `similar:${articleId}`
}
