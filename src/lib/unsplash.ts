/**
 * Serviço de integração com Unsplash API
 * Fornece imagens relacionadas aos artigos científicos
 */

interface UnsplashImage {
  id: string
  urls: {
    raw: string
    full: string
    regular: string
    small: string
    thumb: string
  }
  alt_description: string | null
  description: string | null
  user: {
    name: string
    username: string
  }
  links: {
    html: string
  }
}

interface UnsplashSearchResponse {
  results: UnsplashImage[]
  total: number
  total_pages: number
}

class UnsplashService {
  private accessKey: string | undefined
  private baseUrl = 'https://api.unsplash.com'
  private cache = new Map<string, UnsplashImage>()
  private cacheExpiry = new Map<string, number>()
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 horas

  constructor() {
    // Usa NEXT_PUBLIC_ para client-side, fallback para server-side
    this.accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || process.env.UNSPLASH_ACCESS_KEY
  }

  /**
   * Verifica se o serviço está configurado
   */
  isConfigured(): boolean {
    return !!this.accessKey
  }

  /**
   * Busca uma imagem relacionada ao tópico do artigo
   */
  async getImageForArticle(
    title: string,
    category?: string,
    keywords?: string[]
  ): Promise<UnsplashImage | null> {
    if (!this.isConfigured()) {
      console.warn('Unsplash API não configurada. Defina UNSPLASH_ACCESS_KEY no .env')
      return null
    }

    try {
      // Gera uma chave de cache baseada no conteúdo
      const cacheKey = this.generateCacheKey(title, category, keywords)
      
      // Verifica cache
      const cached = this.getFromCache(cacheKey)
      if (cached) {
        return cached
      }

      // Gera termos de busca baseados no artigo
      const searchTerms = this.generateSearchTerms(title, category, keywords)
      
      // Busca imagem no Unsplash
      const image = await this.searchImage(searchTerms)
      
      // Armazena no cache
      if (image) {
        this.setCache(cacheKey, image)
      }
      
      return image
    } catch (error) {
      console.error('Erro ao buscar imagem no Unsplash:', error)
      return null
    }
  }

  /**
   * Busca imagem por termos específicos
   */
  private async searchImage(query: string): Promise<UnsplashImage | null> {
    const url = `${this.baseUrl}/search/photos`
    const params = new URLSearchParams({
      query,
      per_page: '1',
      orientation: 'landscape',
      content_filter: 'high',
      order_by: 'relevant'
    })

    const response = await fetch(`${url}?${params}`, {
      headers: {
        'Authorization': `Client-ID ${this.accessKey!}`,
        'Accept-Version': 'v1'
      }
    })

    if (!response.ok) {
      console.error(`Unsplash API error: ${response.status} - ${response.statusText}`)
      const errorText = await response.text()
      console.error('Error details:', errorText)
      throw new Error(`Unsplash API error: ${response.status}`)
    }

    const data: UnsplashSearchResponse = await response.json()
    
    // Retorna a primeira imagem relevante
    return data.results.length > 0 ? data.results[0] : null
  }

  /**
   * Gera termos de busca baseados no artigo
   */
  private generateSearchTerms(
    title: string,
    category?: string,
    keywords?: string[]
  ): string {
    const terms: string[] = []

    // Adiciona categoria se disponível
    if (category) {
      const categoryMap: Record<string, string> = {
        'Clínica': 'therapy',
        'Educação': 'education',
        'Organizacional': 'business',
        'Pesquisa': 'research',
        'Experimental': 'science'
      }
      terms.push(categoryMap[category] || 'science')
    }

    // Adiciona palavras-chave relevantes (simplificadas)
    if (keywords && keywords.length > 0) {
      const relevantKeywords = keywords
        .slice(0, 1) // Máximo 1 palavra-chave para simplificar
        .filter((keyword): keyword is string => keyword != null && typeof keyword === 'string' && keyword.trim() !== '')
        .map(keyword => this.translateKeyword(keyword))
        .filter(Boolean)
      
      terms.push(...relevantKeywords)
    }

    // Se não há termos específicos, usa termos genéricos
    if (terms.length === 0) {
      terms.push('science')
    }

    const searchQuery = terms.join(' ')
    return searchQuery
  }

  /**
   * Traduz palavras-chave básicas para inglês
   */
  private translateKeyword(keyword: string): string {

    const translations: Record<string, string> = {
      'comportamento': 'behavior',
      'aprendizagem': 'learning',
      'terapia': 'therapy',
      'educação': 'education',
      'criança': 'child',
      'adulto': 'adult',
      'desenvolvimento': 'development',
      'intervenção': 'intervention',
      'análise': 'analysis',
      'experimental': 'experimental',
      'clínico': 'clinical',
      'social': 'social'
    }

    const lowerKeyword = keyword.toLowerCase()
    return translations[lowerKeyword] || keyword
  }

  /**
   * Gera chave de cache
   */
  private generateCacheKey(
    title: string,
    category?: string,
    keywords?: string[]
  ): string {
    const parts = [title.slice(0, 50)]
    if (category) parts.push(category)
    if (keywords) parts.push(keywords.slice(0, 2).join(','))
    
    return parts.join('|').toLowerCase()
  }

  /**
   * Recupera item do cache se ainda válido
   */
  private getFromCache(key: string): UnsplashImage | null {
    const expiry = this.cacheExpiry.get(key)
    if (!expiry || Date.now() > expiry) {
      this.cache.delete(key)
      this.cacheExpiry.delete(key)
      return null
    }
    
    return this.cache.get(key) || null
  }

  /**
   * Armazena item no cache
   */
  private setCache(key: string, image: UnsplashImage): void {
    this.cache.set(key, image)
    this.cacheExpiry.set(key, Date.now() + this.CACHE_DURATION)
    
    // Limita o tamanho do cache
    if (this.cache.size > 100) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
        this.cacheExpiry.delete(oldestKey)
      }
    }
  }

  /**
   * Limpa o cache
   */
  clearCache(): void {
    this.cache.clear()
    this.cacheExpiry.clear()
  }
}

// Instância singleton
const unsplashService = new UnsplashService()

export { unsplashService, type UnsplashImage }
export default unsplashService