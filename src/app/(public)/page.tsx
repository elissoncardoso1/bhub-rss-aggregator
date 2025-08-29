import { Suspense } from "react"
import { prisma } from "@/src/lib/prisma"
import { ArticleCard } from "@/src/components/ArticleCard"
import { HomeSearchBar } from "@/src/components/HomeSearchBar"
import { BannerAd } from "@/src/components/BannerAd"
import { 
  Rss, 
  Target, 
  Users,
  ChevronRight,
  ArrowRight,
  BookOpen,
  TrendingUp,
  Clock,
  User,
  Star
} from "lucide-react"
import Link from "next/link"
import { formatDateOnly } from "@/src/lib/utils"

// Busca dados reais da homepage
async function getHomePageData() {
  try {
    const [
      totalArticles,
      totalFeeds,
      activeFeeds,
      totalAuthors,
      articlesToday,
      recentArticles,
      highlightedArticles,
      popularCategories
    ] = await Promise.all([
      // Total de artigos não arquivados
      prisma.article.count({
        where: { isArchived: false }
      }),
      
      // Total de feeds
      prisma.feed.count(),
      
      // Feeds ativos
      prisma.feed.count({
        where: { isActive: true }
      }),
      
      // Total de autores
      prisma.author.count(),
      
      // Artigos adicionados hoje
      prisma.article.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          },
          isArchived: false
        }
      }),
      
      // Artigos recentes (últimos 10)
      prisma.article.findMany({
        where: { isArchived: false },
        select: {
          id: true,
          title: true,
          abstract: true,
          createdAt: true,
          originalUrl: true,
          viewCount: true,
          highlighted: true,
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
            take: 3
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      
      // Artigos destacados
      prisma.article.findMany({
        where: { 
          isArchived: false,
          highlighted: true
        },
        select: {
          id: true,
          title: true,
          abstract: true,
          createdAt: true,
          originalUrl: true,
          viewCount: true,
          highlighted: true,
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
            take: 3
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      
      // Categorias mais populares
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
        },
        take: 5
      })
    ])

    return {
      totals: {
        articles: totalArticles,
        feeds: totalFeeds,
        activeFeeds,
        authors: totalAuthors
      },
      today: {
        articles: articlesToday
      },
      recentArticles: recentArticles.map(article => ({
        id: article.id.toString(),
        title: article.title,
        abstract: article.abstract || '',
        createdAt: article.createdAt,
        originalUrl: article.originalUrl || '',
        viewCount: article.viewCount,
        highlighted: article.highlighted,
        feedName: article.feed.name,
        journalName: article.feed.journalName,
        category: article.category ? {
          name: article.category.name,
          color: article.category.color
        } : null,
        authors: article.authors.map((a: { author: { name: string } }) => a.author.name)
      })),
      highlightedArticles: highlightedArticles.map(article => ({
        id: article.id.toString(),
        title: article.title,
        abstract: article.abstract || '',
        createdAt: article.createdAt,
        originalUrl: article.originalUrl || '',
        viewCount: article.viewCount,
        highlighted: article.highlighted,
        feedName: article.feed.name,
        journalName: article.feed.journalName,
        category: article.category ? {
          name: article.category.name,
          color: article.category.color
        } : null,
        authors: article.authors.map((a: { author: { name: string } }) => a.author.name)
      })),
      popularCategories
    }
  } catch (error) {
    console.error('Erro ao carregar dados da homepage:', error)
    return null
  }
}

// Componente da sidebar esquerda
function LeftSidebar({ stats, categories }: { stats: any, categories: any[] }) {
  return (
    <aside className="journal-sidebar">
      {/* Seção de categorias populares */}
      <div className="journal-sidebar-section">
        <h2 className="journal-sidebar-title">Categorias</h2>
        <div className="space-y-2">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              href={`/repository?category=${category.slug}`} 
              className="block text-sm text-gray-700 hover:text-red-600 transition-colors"
            >
              • {category.name} ({category._count.articles})
            </Link>
          ))}
          
          {/* Link para repositório completo */}
          <div className="pt-2 border-t border-gray-200">
            <Link 
              href="/repository" 
              className="block text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              📚 Ver Todas as Categorias →
            </Link>
          </div>
        </div>
      </div>

      {/* Seção de números */}
      <div className="journal-sidebar-section">
        <h2 className="journal-sidebar-title">Em Números</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total de Artigos</span>
            <span className="font-semibold text-red-600">{stats?.totals?.articles || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Feeds Ativos</span>
            <span className="font-semibold text-red-600">{stats?.totals?.activeFeeds || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Pesquisadores</span>
            <span className="font-semibold text-red-600">{stats?.totals?.authors || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Hoje</span>
            <span className="font-semibold text-red-600">{stats?.today?.articles || 0}</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

// Componente da sidebar direita
function RightSidebar({ recentArticles }: { recentArticles: any[] }) {
  return (
    <aside className="journal-sidebar">
      {/* Mais Acessados */}
      <div className="journal-sidebar-section">
        <h2 className="journal-sidebar-title">Mais Acessados</h2>
        <div className="space-y-3">
          {recentArticles.slice(0, 5).map((article: any, index: number) => (
            <div key={article.id} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-red-600 text-white text-xs flex items-center justify-center font-semibold">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <Link href={`/articles/${article.id}`} className="block group">
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 mb-1">
                    {article.title}
                  </h3>
                </Link>
                <p className="text-xs text-gray-500">{article.journalName}</p>
                <p className="text-xs text-gray-400">{article.viewCount} visualizações</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Links Rápidos */}
      <div className="journal-sidebar-section">
        <h2 className="journal-sidebar-title">Links Rápidos</h2>
        <div className="space-y-2">
          <Link href="/repository" className="flex items-center justify-between text-sm text-gray-700 hover:text-red-600 transition-colors">
            <span>Ver Todos os Artigos</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
          <Link href="/repository?highlighted=true" className="flex items-center justify-between text-sm text-gray-700 hover:text-yellow-600 transition-colors">
            <span>⭐ Artigos Destacados</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
          <Link href="/about" className="flex items-center justify-between text-sm text-gray-700 hover:text-red-600 transition-colors">
            <span>Sobre o Projeto</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
          <Link href="/contact" className="flex items-center justify-between text-sm text-gray-700 hover:text-red-600 transition-colors">
            <span>Entre em Contato</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </aside>
  )
}

export default async function HomePage() {
  const homeData = await getHomePageData()
  
  if (!homeData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-600 mb-2">Erro ao carregar dados</h1>
          <p className="text-gray-500">Não foi possível carregar os dados da homepage.</p>
        </div>
      </div>
    )
  }

  const { recentArticles, highlightedArticles, popularCategories } = homeData
  
  return (
    <div className="min-h-screen bg-white">
      {/* Barra de busca principal */}
      <section className="bg-gray-50 border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h1 className="journal-headline-main mb-4">
              <span className="text-gradient">bhub</span>
              <br />
              <span className="text-2xl md:text-3xl font-normal">
                Agregador RSS de Análise do Comportamento
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Mantenha-se atualizado com os últimos artigos científicos em Análise do Comportamento Aplicada. 
              Centralizamos conteúdo de diversos periódicos em um só lugar.
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <HomeSearchBar />
          </div>
        </div>
      </section>

      {/* Layout principal de 3 colunas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Esquerda */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <LeftSidebar stats={homeData} categories={popularCategories} />
          </div>

          {/* Conteúdo Central */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            {/* Seção de Artigos Destacados */}
            {highlightedArticles.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full"></div>
                    <h2 className="journal-headline-secondary text-2xl">
                      ⭐ Artigos em Destaque
                    </h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-yellow-400 to-transparent ml-4"></div>
                  </div>
                  
                  <div className="text-sm text-gray-500 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                    {highlightedArticles.length} artigo{highlightedArticles.length !== 1 ? 's' : ''} destacado{highlightedArticles.length !== 1 ? 's' : ''}
                  </div>
                </div>
                
                <div className="space-y-6">
                  {highlightedArticles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={{
                        id: article.id,
                        title: article.title,
                        abstract: article.abstract,
                        publicationDate: article.createdAt,
                        originalUrl: article.originalUrl,
                        feedName: article.feedName,
                        journalName: article.journalName,
                        category: article.category,
                        authors: article.authors,
                        highlighted: article.highlighted,
                        viewCount: article.viewCount
                      }}
                      variant="main"
                      showImage={true}
                      className="border-l-4 border-l-yellow-400"
                    />
                  ))}
                </div>
                
                {/* Links para navegação */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                  <Link
                    href="/repository?highlighted=true"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-medium hover:from-yellow-500 hover:to-orange-600 transition-all duration-200 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    Ver Todos os Artigos Destacados
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  
                  <Link
                    href="/repository"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-white font-medium hover:bg-gray-700 transition-all duration-200 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    Explorar Repositório Completo
                    <BookOpen className="h-5 w-5" />
                  </Link>
                </div>
                
                {/* Separador visual */}
                <div className="my-8 border-t-2 border-dashed border-yellow-200"></div>
              </section>
            )}

            {/* Banner Entre Seções */}
            <div className="my-8">
              <BannerAd position="between-articles" />
            </div>

            {/* Seção de Artigos Recentes */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-red-600 to-red-500 rounded-full"></div>
                <h2 className="journal-headline-secondary text-2xl">
                  📰 Últimas Publicações
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-red-600 to-transparent"></div>
              </div>
              
              {/* Artigo Principal */}
              {recentArticles.length > 0 && (
                <ArticleCard
                  article={{
                    id: recentArticles[0].id,
                    title: recentArticles[0].title,
                    abstract: recentArticles[0].abstract,
                    publicationDate: recentArticles[0].createdAt,
                    originalUrl: recentArticles[0].originalUrl,
                    feedName: recentArticles[0].feedName,
                    journalName: recentArticles[0].journalName,
                    category: recentArticles[0].category,
                    authors: recentArticles[0].authors,
                    highlighted: recentArticles[0].highlighted,
                    viewCount: recentArticles[0].viewCount
                  }}
                  variant="main"
                  showImage={true}
                  className="mb-8"
                />
              )}

              {/* Chamadas Secundárias */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  {recentArticles.slice(1, 5).map((article: typeof recentArticles[0]) => (
                    <ArticleCard
                      key={article.id}
                      article={{
                        id: article.id,
                        title: article.title,
                        abstract: article.abstract,
                        publicationDate: article.createdAt,
                        originalUrl: article.originalUrl,
                        feedName: article.feedName,
                        journalName: article.journalName,
                        category: article.category,
                        authors: article.authors,
                        highlighted: article.highlighted,
                        viewCount: article.viewCount
                      }}
                      variant="secondary"
                      showImage={true}
                    />
                  ))}
                </div>

                {/* Mais artigos em lista */}
                {recentArticles.length > 5 && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="journal-headline text-lg mb-4">Outras Publicações</h3>
                    <div className="space-y-4">
                      {recentArticles.slice(5, 10).map((article: typeof recentArticles[0]) => (
                        <div key={article.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex-1 min-w-0">
                            <Link href={`/articles/${article.id}`} className="block group">
                              <h3 className="font-medium text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 mb-2">
                                {article.title}
                              </h3>
                            </Link>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {article.createdAt && formatDateOnly(article.createdAt)}
                              </span>
                              <span className="flex items-center gap-1">
                                <BookOpen className="h-4 w-4" />
                                By {article.journalName}
                              </span>
                              {article.authors.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <User className="h-4 w-4" />
                                  Por {article.authors.slice(0, 2).join(", ")}
                                  {article.authors.length > 2 && ` +${article.authors.length - 2}`}
                                </span>
                              )}
                            </div>
                          </div>
                          <Link href={`/articles/${article.id}`}>
                            <ArrowRight className="h-5 w-5 text-gray-400 hover:text-red-600 transition-colors" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Link para ver todos os artigos */}
                <div className="text-center pt-8 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      href="/repository"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-medium hover:bg-red-700 transition-all duration-200 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      Ver Todos os Artigos
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                    
                    <Link
                      href="/repository?highlighted=true"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white font-medium hover:bg-yellow-600 transition-all duration-200 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      Ver Artigos Destacados
                      <Star className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar Direita */}
          <div className="lg:col-span-3 order-3">
            <RightSidebar recentArticles={recentArticles} />
          </div>
        </div>
      </div>

      {/* Banner Antes dos Recursos */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <BannerAd position="between-articles" />
        </div>
      </div>

      {/* Seção de recursos */}
      <section className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="journal-headline-secondary mb-4">
              Por que usar o bhub?
            </h2>
            <p className="journal-body max-w-2xl mx-auto">
              Desenvolvido especificamente para a comunidade de Análise do Comportamento
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center journal-card p-6">
              <div className="mx-auto mb-4 p-3 bg-red-100 w-fit">
                <Rss className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="journal-headline text-lg mb-3">Agregação Automática</h3>
              <p className="journal-body text-sm">
                Coletamos automaticamente artigos de múltiplos periódicos via RSS/Atom, 
                mantendo você sempre atualizado.
              </p>
            </div>

            <div className="text-center journal-card p-6">
              <div className="mx-auto mb-4 p-3 bg-orange-100 w-fit">
                <Target className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="journal-headline text-lg mb-3">Categorização Inteligente</h3>
              <p className="journal-body text-sm">
                Artigos são automaticamente categorizados por área (Clínica, Educação, 
                Experimental, etc.) para facilitar a busca.
              </p>
            </div>

            <div className="text-center journal-card p-6">
              <div className="mx-auto mb-4 p-3 bg-blue-100 w-fit">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="journal-headline text-lg mb-3">Busca por Autor</h3>
              <p className="journal-body text-sm">
                Encontre facilmente trabalhos de pesquisadores específicos e 
                acompanhe suas publicações mais recentes.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
