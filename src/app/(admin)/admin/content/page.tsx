'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
// Componentes de UI removidos - não disponíveis no projeto
import { 
  Star, 
  Image as ImageIcon, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Eye,
  EyeOff
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import BannerModal from '@/src/components/BannerModal'
import ArticleSearchModal from '@/src/components/ArticleSearchModal'

interface Article {
  id: string
  title: string
  abstract: string
  highlighted: boolean
  createdAt: string
  category?: {
    name: string
    color: string
  }
  feed?: {
    name: string
  }
  viewCount: number
}

interface Banner {
  id: string
  title: string
  description?: string
  imageUrl?: string
  linkUrl?: string
  position: 'HEADER' | 'SIDEBAR' | 'BETWEEN_ARTICLES' | 'FOOTER'
  isActive: boolean
  priority: number
  clickCount: number
  startDate?: string
  endDate?: string
  createdAt: string
}

export default function ContentManagementPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterHighlighted, setFilterHighlighted] = useState<'all' | 'highlighted' | 'normal'>('all')
  const [activeTab, setActiveTab] = useState<'articles' | 'banners'>('articles')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [articlesRes, bannersRes] = await Promise.all([
        fetch('/api/admin/articles'),
        fetch('/api/admin/banners')
      ])
      
      if (articlesRes.ok) {
        const articlesData = await articlesRes.json()
        setArticles(articlesData.articles || [])
      }
      
      if (bannersRes.ok) {
        const bannersData = await bannersRes.json()
        setBanners(bannersData.banners || [])
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleArticleHighlight = async (articleId: string, currentHighlighted: boolean) => {
    try {
      const response = await fetch(`/api/admin/articles/${articleId}/highlight`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ highlighted: !currentHighlighted })
      })

      if (response.ok) {
        setArticles(prev => prev.map(article => 
          article.id === articleId 
            ? { ...article, highlighted: !currentHighlighted }
            : article
        ))
      }
    } catch (error) {
      console.error('Erro ao alterar destaque:', error)
    }
  }

  const toggleBannerStatus = async (bannerId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/banners/${bannerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (response.ok) {
        setBanners(prev => prev.map(banner => 
          banner.id === bannerId 
            ? { ...banner, isActive: !currentStatus }
            : banner
        ))
      }
    } catch (error) {
      console.error('Erro ao alterar status do banner:', error)
    }
  }

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.abstract.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterHighlighted === 'all' || 
                         (filterHighlighted === 'highlighted' && article.highlighted) ||
                         (filterHighlighted === 'normal' && !article.highlighted)
    
    return matchesSearch && matchesFilter
  })

  const getPositionLabel = (position: string) => {
    const labels = {
      'HEADER': 'Cabeçalho',
      'SIDEBAR': 'Barra Lateral',
      'BETWEEN_ARTICLES': 'Entre Artigos',
      'FOOTER': 'Rodapé'
    }
    return labels[position as keyof typeof labels] || position
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gerenciamento de Conteúdo
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gerencie artigos destacados e banners publicitários
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
            📚 Sistema configurado como repositório de consulta - Artigos antigos são preservados
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <BannerModal onBannerCreated={loadData} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('articles')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'articles'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Artigos Destacados
        </button>
        <button
          onClick={() => setActiveTab('banners')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'banners'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Banners
        </button>
      </div>

      {activeTab === 'articles' && (
        <div className="space-y-6">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Buscar artigos</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Digite o título ou resumo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="w-full md:w-48">
                  <Label htmlFor="filter">Status</Label>
                  <select 
                    value={filterHighlighted} 
                    onChange={(e) => setFilterHighlighted(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="all">Todos</option>
                    <option value="highlighted">Destacados</option>
                    <option value="normal">Normais</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Buscar e Destacar Artigos */}
          <div className="flex justify-center">
            <ArticleSearchModal onArticleHighlighted={loadData} />
          </div>

          {/* Lista de Artigos */}
          <div className="grid grid-cols-1 gap-4">
            {filteredArticles.map((article) => (
              <Card key={article.id} className={`transition-all ${
                article.highlighted ? 'ring-2 ring-yellow-400 bg-yellow-50 dark:bg-yellow-900/10' : ''
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {article.highlighted && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                        <h3 className="font-semibold text-lg">{article.title}</h3>
                        {article.category && (
                          <Badge 
                            style={{ backgroundColor: article.category.color }}
                            className="text-white"
                          >
                            {article.category.name}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {article.abstract}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{new Date(article.createdAt).toLocaleDateString('pt-BR')}</span>
                        {article.feed && <span>• {article.feed.name}</span>}
                        <span>• {article.viewCount} visualizações</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant={article.highlighted ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleArticleHighlight(article.id, article.highlighted)}
                      >
                        <Star className={`h-4 w-4 mr-1 ${
                          article.highlighted ? 'fill-current' : ''
                        }`} />
                        {article.highlighted ? 'Destacado' : 'Destacar'}
                      </Button>
                      
                      <Link href={`/articles/${article.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'banners' && (
        <div className="space-y-6">
          {/* Lista de Banners */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.map((banner) => (
              <Card key={banner.id} className={`transition-all ${
                !banner.isActive ? 'opacity-60' : ''
              }`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{banner.title}</CardTitle>
                      <Badge variant={banner.isActive ? "success" : "secondary"} className="mt-1">
                        {banner.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleBannerStatus(banner.id, banner.isActive)}
                      >
                        {banner.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {banner.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {banner.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Posição:</span>
                      <Badge variant="outline">
                        {getPositionLabel(banner.position)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Prioridade:</span>
                      <span>{banner.priority}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Cliques:</span>
                      <span>{banner.clickCount}</span>
                    </div>
                    
                    {banner.imageUrl && (
                      <div className="mt-3">
                        <Image 
                          src={banner.imageUrl} 
                          alt={banner.title}
                          width={400}
                          height={96}
                          className="w-full h-24 object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}