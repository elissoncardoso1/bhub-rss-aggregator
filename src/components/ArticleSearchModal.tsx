'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Search, Star, X } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'

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

interface ArticleSearchModalProps {
  onArticleHighlighted: () => void
}

function ArticleSearchModal({ onArticleHighlighted }: ArticleSearchModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [articles, setArticles] = useState<Article[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'highlighted' | 'normal'>('normal')

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        search: searchTerm,
        highlighted: selectedFilter,
        limit: '20'
      })
      
      const response = await fetch(`/api/admin/articles?${params}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setArticles(data.articles || [])
      } else if (response.status === 401) {
        console.error('Não autorizado - faça login como administrador')
        setArticles([])
      } else {
        console.error('Erro ao buscar artigos:', response.status)
        setArticles([])
      }
    } catch (error) {
      console.error('Erro ao buscar artigos:', error)
      setArticles([])
    } finally {
      setLoading(false)
    }
  }, [searchTerm, selectedFilter])

  useEffect(() => {
    if (open) {
      fetchArticles()
    }
  }, [open, searchTerm, selectedFilter, fetchArticles])

  const toggleArticleHighlight = async (articleId: string, currentHighlighted: boolean) => {
    try {
      const response = await fetch(`/api/admin/articles/${articleId}/highlight`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          highlighted: !currentHighlighted
        })
      })

      if (response.ok) {
        // Atualizar o artigo na lista local
        setArticles(prev => prev.map(article => 
          article.id === articleId 
            ? { ...article, highlighted: !currentHighlighted }
            : article
        ))
        onArticleHighlighted()
      }
    } catch (error) {
      console.error('Erro ao alterar destaque do artigo:', error)
    }
  }

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Search className="h-4 w-4 mr-2" />
        Buscar Artigos para Destacar
      </Button>
    )
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Search className="h-4 w-4 mr-2" />
        Buscar Artigos para Destacar
      </Button>
      
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Buscar e Destacar Artigos</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Filtros de Busca */}
              <div className="space-y-4 mb-6">
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
                      value={selectedFilter} 
                      onChange={(e) => setSelectedFilter(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todos</option>
                      <option value="highlighted">Destacados</option>
                      <option value="normal">Normais</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Lista de Artigos */}
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Carregando artigos...</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {articles.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum artigo encontrado</p>
                    </div>
                  ) : (
                    articles.map((article) => (
                      <Card key={article.id} className={`transition-all hover:shadow-md ${
                        article.highlighted ? 'ring-2 ring-yellow-400 bg-yellow-50' : ''
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {article.highlighted && (
                                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                )}
                                <h3 className="font-semibold text-sm">{article.title}</h3>
                                {article.category && (
                                  <Badge 
                                    style={{ backgroundColor: article.category.color }}
                                    className="text-white text-xs"
                                  >
                                    {article.category.name}
                                  </Badge>
                                )}
                              </div>
                              
                              <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                                {article.abstract}
                              </p>
                              
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>{new Date(article.createdAt).toLocaleDateString('pt-BR')}</span>
                                {article.feed && <span>• {article.feed.name}</span>}
                                <span>• {article.viewCount} visualizações</span>
                              </div>
                            </div>
                            
                            <div className="ml-4">
                              <Button
                                variant={article.highlighted ? "default" : "outline"}
                                size="sm"
                                onClick={() => toggleArticleHighlight(article.id, article.highlighted)}
                              >
                                <Star className={`h-4 w-4 mr-1 ${
                                  article.highlighted ? 'fill-current' : ''
                                }`} />
                                {article.highlighted ? 'Remover' : 'Destacar'}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}

              <div className="flex justify-end mt-6">
                <Button onClick={() => setOpen(false)}>
                  Fechar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}

export default ArticleSearchModal