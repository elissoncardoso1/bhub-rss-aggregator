import { Suspense } from "react"
import { prisma } from "@/src/lib/prisma"
import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { FeedSyncButton } from "@/src/components/FeedSyncButton"
import { Plus, RefreshCw, AlertTriangle, ExternalLink, Clock } from "lucide-react"

async function getFeedsData() {
  const feeds = await prisma.feed.findMany({
    select: {
      id: true,
      name: true,
      journalName: true,
      feedUrl: true,
      feedType: true,
      country: true,
      language: true,
      isActive: true,
      lastSyncAt: true,
      syncFrequency: true,
      errorCount: true,
      lastError: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          articles: true
        }
      }
    },
    orderBy: {
      id: 'desc'
    }
  })
  
  return feeds
}

function FeedCard({ feed }: { feed: any }) {
  const statusColor = feed.isActive 
    ? (feed.errorCount > 0 ? 'text-yellow-600 bg-yellow-100' : 'text-green-600 bg-green-100')
    : 'text-red-600 bg-red-100'

  const statusText = feed.isActive 
    ? (feed.errorCount > 0 ? 'Com Problemas' : 'Ativo')
    : 'Inativo'

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {feed.name}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            {feed.journalName}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="px-2 py-1 bg-gray-100 rounded">
              {feed.feedType}
            </span>
            {feed.country && (
              <span className="px-2 py-1 bg-gray-100 rounded">
                {feed.country}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
            {statusText}
          </span>
          <div className="text-right text-xs text-gray-500">
            <div>{feed.articleCount} artigos</div>
            {feed.lastSyncAt && (
              <div className="flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3" />
                {new Date(feed.lastSyncAt).toLocaleDateString('pt-BR')}
              </div>
            )}
          </div>
        </div>
      </div>

      {feed.lastError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-700">
            <strong>Último erro:</strong> {feed.lastError}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <a 
          href={feed.feedUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
        >
          <ExternalLink className="h-4 w-4" />
          Ver Feed
        </a>
        
        <div className="flex items-center gap-2">
          <FeedSyncButton feedId={feed.id} />
          
          <Link href={`/admin/feeds/${feed.id}`}>
            <Button variant="outline" size="sm">
              Editar
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

async function FeedsSection() {
  const feeds = await getFeedsData()

  const activeFeeds = feeds.filter(f => f.isActive)
  const inactiveFeeds = feeds.filter(f => !f.isActive)
  const feedsWithErrors = feeds.filter(f => f.errorCount > 0)

  return (
    <div>
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <RefreshCw className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Feeds Ativos</p>
              <p className="text-2xl font-semibold text-gray-900">{activeFeeds.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Com Problemas</p>
              <p className="text-2xl font-semibold text-gray-900">{feedsWithErrors.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-gray-100 rounded-lg">
              <RefreshCw className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Feeds</p>
              <p className="text-2xl font-semibold text-gray-900">{feeds.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Feeds */}
      <div className="space-y-6">
        {activeFeeds.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Feeds Ativos ({activeFeeds.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeFeeds.map((feed) => (
                <FeedCard key={feed.id} feed={feed} />
              ))}
            </div>
          </div>
        )}

        {inactiveFeeds.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Feeds Inativos ({inactiveFeeds.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {inactiveFeeds.map((feed) => (
                <FeedCard key={feed.id} feed={feed} />
              ))}
            </div>
          </div>
        )}

        {feeds.length === 0 && (
          <div className="text-center py-12">
            <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum feed cadastrado
            </h3>
            <p className="text-gray-600 mb-6">
              Comece adicionando seu primeiro feed RSS/Atom.
            </p>
            <Link href="/admin/feeds/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Feed
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default function FeedsPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gerenciar Feeds
            </h1>
            <p className="text-gray-600 mt-2">
              Administre os feeds RSS/Atom do sistema
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/admin/feeds/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Feed
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <Suspense fallback={
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      }>
        <FeedsSection />
      </Suspense>
    </div>
  )
}
