import { notFound } from "next/navigation"
import { prisma } from "@/src/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { ArticleCard } from "@/src/components/ArticleCard"
import { ShareButton } from "@/src/components/ShareButton"
import { TranslatableText } from "@/src/components/TranslatableText"
import { formatDateOnly, truncateText } from "@/src/lib/utils"
import { 
  ExternalLink, 
  Calendar, 
  User, 
  Building, 
  Tag,
  Eye,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"

interface ArticlePageProps {
  params: {
    id: string
  }
}

async function getArticle(id: string) {
  const article = await prisma.article.findUnique({
    where: { id: BigInt(id) },
    select: {
      id: true,
      title: true,
      abstract: true,
      authorsRaw: true,
      keywordsRaw: true,
      doi: true,
      publicationDate: true,
      originalUrl: true,
      feedEntryDate: true,
      viewCount: true,
      createdAt: true,
      feed: {
        select: {
          name: true,
          journalName: true,
          country: true,
          language: true
        }
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          color: true,
          description: true
        }
      },
      authors: {
        select: {
          author: {
            select: {
              id: true,
              name: true,
              articleCount: true
            }
          },
          authorOrder: true
        },
        orderBy: { authorOrder: 'asc' }
      }
    }
  })

  if (!article) {
    return null
  }

  // Incrementa contador de visualizações
  await prisma.article.update({
    where: { id: BigInt(id) },
    data: { viewCount: { increment: 1 } }
  })

  return {
    ...article,
    id: article.id.toString(),
    authors: article.authors.map(a => a.author),
    keywords: article.keywordsRaw ? JSON.parse(article.keywordsRaw) : [],
    authorsFromRaw: article.authorsRaw ? JSON.parse(article.authorsRaw) : []
  }
}

async function getSimilarArticles(articleId: string, categoryId?: bigint | null) {
  if (!categoryId) return []

  const articles = await prisma.article.findMany({
    where: {
      AND: [
        { id: { not: BigInt(articleId) } },
        { isArchived: false },
        { categoryId: categoryId }
      ]
    },
    select: {
      id: true,
      title: true,
      abstract: true,
      publicationDate: true,
      originalUrl: true,
      viewCount: true,
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
    orderBy: [
      { publicationDate: 'desc' },
      { viewCount: 'desc' }
    ],
    take: 3
  })

  return articles.map(article => ({
    id: article.id.toString(),
    title: article.title,
    abstract: article.abstract,
    publicationDate: article.publicationDate,
    originalUrl: article.originalUrl,
    viewCount: article.viewCount,
    feedName: article.feed.name,
    journalName: article.feed.journalName,
    category: article.category,
    authors: article.authors.map(a => a.author.name)
  }))
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticle(params.id)
  
  if (!article) {
    notFound()
  }

  const similarArticles = await getSimilarArticles(params.id, article.category?.id)

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link 
            href="/repository" 
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Repositório
          </Link>
        </nav>

        {/* Artigo principal */}
        <article className="mb-12">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight mb-4">
                    {article.title}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      <span className="font-medium">{article.feed.journalName}</span>
                    </div>
                    
                    {article.publicationDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDateOnly(article.publicationDate)}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{article.viewCount} visualizações</span>
                    </div>
                  </div>
                </div>
                
                {article.category && (
                  <Badge
                    variant="secondary"
                    style={{
                      backgroundColor: article.category.color + "20",
                      color: article.category.color,
                      borderColor: article.category.color + "40"
                    }}
                    className="shrink-0"
                  >
                    {article.category.name}
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {/* Resumo/Abstract */}
              {article.abstract && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Resumo
                  </h2>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <div className="text-gray-700 dark:text-gray-300">
                      <TranslatableText
                        text={article.abstract}
                        variant="block"
                        showTranslateButton={true}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Metadados */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Autores */}
                {article.authors.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Autores
                    </h3>
                    <div className="space-y-2">
                      {article.authors.map((author) => (
                        <Link
                          key={author.id.toString()}
                          href={`/repository?author=${encodeURIComponent(author.name)}`}
                          className="block p-2 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="font-medium text-sm">{author.name}</div>
                          <div className="text-xs text-gray-500">
                            {author.articleCount} artigo{author.articleCount !== 1 ? 's' : ''}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Informações do periódico */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Periódico
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Nome:</span> {article.feed.journalName}
                    </div>
                    <div>
                      <span className="font-medium">Feed:</span> {article.feed.name}
                    </div>
                    {article.feed.country && (
                      <div>
                        <span className="font-medium">País:</span> {article.feed.country}
                      </div>
                    )}
                    {article.feed.language && (
                      <div>
                        <span className="font-medium">Idioma:</span> {article.feed.language}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Palavras-chave */}
              {article.keywords.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Palavras-chave
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {article.keywords.map((keyword: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* DOI */}
              {article.doi && (
                <div className="mb-8">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    DOI
                  </h3>
                  <div className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-3 rounded">
                    <a 
                      href={`https://doi.org/${article.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {article.doi}
                    </a>
                  </div>
                </div>
              )}

              {/* Ações */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                {article.originalUrl && (
                  <a
                    href={article.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button className="w-full">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver Artigo Original
                    </Button>
                  </a>
                )}
                
                <ShareButton 
                  title={article.title}
                  url={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/articles/${article.id}`}
                />
              </div>
            </CardContent>
          </Card>
        </article>

        {/* Artigos similares */}
        {similarArticles.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Artigos Relacionados
            </h2>
            <div className="space-y-6">
              {similarArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
