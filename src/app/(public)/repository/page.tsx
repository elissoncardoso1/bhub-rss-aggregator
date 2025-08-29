import { Suspense } from "react"
import { prisma } from "@/src/lib/prisma"
import { ArticleCard } from "@/src/components/ArticleCard"
import { RepositorySearchBar } from "@/src/components/RepositorySearchBar"
import { LoadingCard } from "@/src/components/LoadingSpinner"
import { BannerAd } from "@/src/components/BannerAd"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { BookOpen, Filter, Calendar, User, Tag, ChevronRight } from "lucide-react"
import Link from "next/link"

interface RepositoryPageProps {
  searchParams: Promise<{
    q?: string
    category?: string
    feed?: string
    author?: string
    year?: string
    page?: string
    highlighted?: string
  }>
}

async function getArticles(searchParams: Awaited<RepositoryPageProps['searchParams']>) {
  const page = parseInt(searchParams.page || "1")
  const limit = 24
  const skip = (page - 1) * limit

  const where: any = {
    isArchived: false
  }

  // Filtro por busca de texto
  if (searchParams.q) {
    where.OR = [
      {
        title: {
          contains: searchParams.q,
          mode: 'insensitive'
        }
      },
      {
        abstract: {
          contains: searchParams.q,
          mode: 'insensitive'
        }
      }
    ]
  }

  // Filtro por categoria
  if (searchParams.category) {
    where.category = {
      slug: searchParams.category
    }
  }

  // Filtro por feed
  if (searchParams.feed) {
    where.feedId = BigInt(searchParams.feed)
  }

  // Filtro por autor
  if (searchParams.author) {
    where.authors = {
      some: {
        author: {
          name: {
            contains: searchParams.author,
            mode: 'insensitive'
          }
        }
      }
    }
  }

  // Filtro por ano
  if (searchParams.year) {
    const year = parseInt(searchParams.year)
    where.publicationDate = {
      gte: new Date(`${year}-01-01`),
      lt: new Date(`${year + 1}-01-01`)
    }
  }

  // Filtro por artigos destacados
  if (searchParams.highlighted === 'true') {
    where.highlighted = true
  }

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      select: {
        id: true,
        title: true,
        abstract: true,
        publicationDate: true,
        originalUrl: true,
        viewCount: true,
        highlighted: true,
        createdAt: true,
        feed: {
          select: {
            name: true,
            journalName: true
          }
        },
        category: {
          select: {
            name: true,
            color: true
          }
        },
        authors: {
          select: {
            author: {
              select: {
                name: true
              }
            },
            authorOrder: true
          },
          orderBy: { authorOrder: 'asc' },
          take: 5
        }
      },
      orderBy: [
        { highlighted: 'desc' }, // Artigos destacados primeiro
        { publicationDate: 'desc' },
        { createdAt: 'desc' }
      ],
      skip,
      take: limit
    }),
    prisma.article.count({ where })
  ])

  const formattedArticles = articles.map(article => ({
    id: article.id.toString(),
    title: article.title,
    abstract: article.abstract,
    publicationDate: article.publicationDate,
    originalUrl: article.originalUrl,
    viewCount: article.viewCount,
    highlighted: article.highlighted,
    feedName: article.feed.name,
    journalName: article.feed.journalName,
    category: article.category,
    authors: article.authors.map(a => a.author.name)
  }))

  return {
    articles: formattedArticles,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}

async function getFilters() {
  const [categories, feeds, years] = await Promise.all([
    // Categorias com contagem de artigos
    prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
        _count: {
          select: {
            articles: {
              where: { isArchived: false }
            }
          }
        }
      },
      orderBy: {
        articles: {
          _count: 'desc'
        }
      }
    }),

    // Feeds com contagem de artigos
    prisma.feed.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        journalName: true,
        _count: {
          select: {
            articles: {
              where: { isArchived: false }
            }
          }
        }
      },
      orderBy: {
        articles: {
          _count: 'desc'
        }
      },
      take: 20
    }),

    // Anos disponíveis
    prisma.article.findMany({
      where: {
        isArchived: false,
        publicationDate: { not: null }
      },
      select: {
        publicationDate: true
      },
      orderBy: {
        publicationDate: 'desc'
      }
    }).then(articles => {
      const years = new Set<number>()
      articles.forEach(article => {
        if (article.publicationDate) {
          years.add(article.publicationDate.getFullYear())
        }
      })
      return Array.from(years).sort((a, b) => b - a)
    })
  ])

  return { categories, feeds, years }
}

function FilterSidebar({ 
  filters, 
  searchParams 
}: { 
  filters: Awaited<ReturnType<typeof getFilters>>
  searchParams: Awaited<RepositoryPageProps['searchParams']>
}) {
  const buildUrl = (newParams: Record<string, string | undefined>) => {
    const params = new URLSearchParams()
    
    // Mantém parâmetros existentes
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== 'page') { // Reset page when filtering
        params.set(key, value)
      }
    })
    
    // Aplica novos parâmetros
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    
    return `/repository?${params.toString()}`
  }

  return (
    <aside className="journal-sidebar">
      {/* Categorias */}
      {filters.categories.length > 0 && (
        <div className="journal-sidebar-section">
          <h2 className="journal-sidebar-title">Categorias</h2>
          <div className="space-y-2">
            {filters.categories.map(category => (
              <Link
                key={category.id.toString()}
                href={buildUrl({ category: searchParams.category === category.slug ? undefined : category.slug })}
                className="block"
              >
                <div className={`flex items-center justify-between py-2 px-3 text-sm transition-colors ${
                  searchParams.category === category.slug
                    ? 'bg-red-50 text-red-700 border-l-2 border-red-600'
                    : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                }`}>
                  <span>{category.name}</span>
                  <span className="text-xs font-medium">{category._count.articles}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Filtro de Artigos Destacados */}
      <div className="journal-sidebar-section">
        <h2 className="journal-sidebar-title">Status</h2>
        <div className="space-y-2">
          <Link
            href={buildUrl({ highlighted: searchParams.highlighted === 'true' ? undefined : 'true' })}
            className="block"
          >
            <div className={`flex items-center gap-2 py-2 px-3 text-sm transition-colors ${
              searchParams.highlighted === 'true'
                ? 'bg-yellow-50 text-yellow-700 border-l-2 border-yellow-600'
                : 'text-gray-700 hover:text-yellow-600 hover:bg-gray-50'
            }`}>
              <span className="text-yellow-500">⭐</span>
              <span>Artigos Destacados</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Anos */}
      {filters.years.length > 0 && (
        <div className="journal-sidebar-section">
          <h2 className="journal-sidebar-title">Ano de Publicação</h2>
          <div className="grid grid-cols-2 gap-2">
            {filters.years.slice(0, 8).map(year => (
              <Link
                key={year}
                href={buildUrl({ year: searchParams.year === year.toString() ? undefined : year.toString() })}
                className={`block text-center py-2 px-3 text-sm border transition-colors ${
                  searchParams.year === year.toString()
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300'
                }`}
              >
                {year}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Periódicos */}
      {filters.feeds.length > 0 && (
        <div className="journal-sidebar-section">
          <h2 className="journal-sidebar-title">Periódicos</h2>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {filters.feeds.map(feed => (
              <Link
                key={feed.id.toString()}
                href={buildUrl({ feed: searchParams.feed === feed.id.toString() ? undefined : feed.id.toString() })}
                className="block"
              >
                <div className={`p-2 text-sm transition-colors ${
                  searchParams.feed === feed.id.toString()
                    ? 'bg-red-50 text-red-700 border-l-2 border-red-600'
                    : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                }`}>
                  <div className="font-medium truncate text-xs">{feed.journalName}</div>
                  <div className="text-xs text-gray-500 flex justify-between mt-1">
                    <span className="truncate">{feed.name}</span>
                    <span className="font-medium">{feed._count.articles}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Limpar filtros */}
      {Object.values(searchParams).some(Boolean) && (
        <div className="journal-sidebar-section">
          <Link 
            href="/repository"
            className="block w-full py-2 px-4 text-center text-sm bg-gray-200 text-gray-700 hover:bg-red-600 hover:text-white transition-colors"
          >
            Limpar Filtros
          </Link>
        </div>
      )}
    </aside>
  )
}

function ArticlesList({ 
  articles, 
  pagination,
  searchParams 
}: { 
  articles: Awaited<ReturnType<typeof getArticles>>['articles']
  pagination: Awaited<ReturnType<typeof getArticles>>['pagination']
  searchParams: Awaited<RepositoryPageProps['searchParams']>
}) {
  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams()
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })
    params.set('page', page.toString())
    return `/repository?${params.toString()}`
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="journal-headline-secondary mb-4">
          Nenhum artigo encontrado
        </h3>
        <p className="journal-body mb-6">
          Tente ajustar os filtros ou termos de busca
        </p>
        <Link 
          href="/repository"
          className="inline-block px-6 py-3 bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
        >
          Ver Todos os Artigos
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho dos resultados */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="journal-headline text-xl">Resultados da Busca</h2>
          <span className="text-sm journal-body">
            Página {pagination.page} de {pagination.totalPages}
          </span>
        </div>
        <p className="journal-body text-sm">
          {pagination.total} artigo{pagination.total !== 1 ? 's' : ''} encontrado{pagination.total !== 1 ? 's' : ''}
          {searchParams.q && ` para "${searchParams.q}"`}
        </p>
      </div>

      {/* Lista de artigos */}
      <div className="space-y-6">
        {articles.map((article, index) => (
          <ArticleCard 
            key={article.id} 
            article={article} 
            variant={index === 0 ? "main" : "secondary"}
            showImage={index < 3}
          />
        ))}
      </div>

      {/* Paginação */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-8 border-t border-gray-200">
          {pagination.page > 1 && (
            <Link 
              href={buildPageUrl(pagination.page - 1)}
              className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Anterior
            </Link>
          )}
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const pageNum = i + Math.max(1, pagination.page - 2)
              if (pageNum > pagination.totalPages) return null
              
              return (
                <Link 
                  key={pageNum} 
                  href={buildPageUrl(pageNum)}
                  className={`px-3 py-2 text-sm transition-colors ${
                    pageNum === pagination.page
                      ? 'bg-red-600 text-white'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </Link>
              )
            })}
          </div>
          
          {pagination.page < pagination.totalPages && (
            <Link 
              href={buildPageUrl(pagination.page + 1)}
              className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Próxima
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

// Componente da sidebar direita para o repositório
function RepositoryRightSidebar({ 
  totalArticles, 
  searchParams 
}: { 
  totalArticles: number
  searchParams: Awaited<RepositoryPageProps['searchParams']>
}) {
  return (
    <aside className="journal-sidebar">
      {/* Informações da busca */}
      <div className="journal-sidebar-section">
        <h2 className="journal-sidebar-title">Sua Busca</h2>
        <div className="space-y-2 text-sm">
          {searchParams.q && (
            <div>
              <span className="text-gray-600">Termo:</span>
              <span className="font-medium text-red-600 ml-1">"{searchParams.q}"</span>
            </div>
          )}
          {searchParams.category && (
            <div>
              <span className="text-gray-600">Categoria:</span>
              <span className="font-medium text-red-600 ml-1">{searchParams.category}</span>
            </div>
          )}
          {searchParams.year && (
            <div>
              <span className="text-gray-600">Ano:</span>
              <span className="font-medium text-red-600 ml-1">{searchParams.year}</span>
            </div>
          )}
          {searchParams.highlighted === 'true' && (
            <div>
              <span className="text-gray-600">Status:</span>
              <span className="font-medium text-yellow-600 ml-1">⭐ Artigos Destacados</span>
            </div>
          )}
          <div className="pt-2 border-t border-gray-200">
            <span className="text-gray-600">Resultados:</span>
            <span className="font-semibold text-red-600 ml-1">{totalArticles}</span>
          </div>
        </div>
      </div>

      {/* Dicas de busca */}
      <div className="journal-sidebar-section">
        <h2 className="journal-sidebar-title">Dicas de Busca</h2>
        <div className="space-y-2 text-xs text-gray-600">
          <p>• Use aspas para buscar frases exatas</p>
          <p>• Combine filtros para resultados mais precisos</p>
          <p>• Explore diferentes categorias</p>
          <p>• Verifique artigos de anos anteriores</p>
        </div>
      </div>

      {/* Links úteis */}
      <div className="journal-sidebar-section">
        <h2 className="journal-sidebar-title">Links Úteis</h2>
        <div className="space-y-2">
          <Link href="/about" className="flex items-center justify-between text-sm text-gray-700 hover:text-red-600 transition-colors">
            <span>Sobre o Projeto</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
          <Link href="/contact" className="flex items-center justify-between text-sm text-gray-700 hover:text-red-600 transition-colors">
            <span>Contato</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Banner da Sidebar */}
      <div className="journal-sidebar-section">
        <BannerAd position="sidebar" />
      </div>
    </aside>
  )
}

export default async function RepositoryPage({ searchParams }: RepositoryPageProps) {
  const resolvedSearchParams = await searchParams
  const [articlesData, filters] = await Promise.all([
    getArticles(resolvedSearchParams),
    getFilters()
  ])

  return (
    <div className="min-h-screen bg-white">
      {/* Header com busca */}
      <section className="bg-gray-50 border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h1 className="journal-headline-main mb-4">
              Repositório de Artigos
            </h1>
            <p className="journal-body max-w-2xl mx-auto">
              Explore nossa coleção de artigos científicos em Análise do Comportamento
            </p>
          </div>
          
          {/* Barra de busca */}
          <div className="max-w-2xl mx-auto">
            <RepositorySearchBar searchParams={resolvedSearchParams} />
          </div>
        </div>
      </section>

      {/* Layout principal de 3 colunas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Esquerda - Filtros */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <FilterSidebar filters={filters} searchParams={resolvedSearchParams} />
          </div>

          {/* Conteúdo Central - Lista de artigos */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            <ArticlesList 
              articles={articlesData.articles}
              pagination={articlesData.pagination}
              searchParams={resolvedSearchParams}
            />
          </div>

          {/* Sidebar Direita - Informações adicionais */}
          <div className="lg:col-span-3 order-3">
            <RepositoryRightSidebar 
              totalArticles={articlesData.pagination.total}
              searchParams={resolvedSearchParams}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
