import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { StatsCard } from "@/src/components/StatsCard"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { SystemInfo } from "@/src/components/SystemInfo"
import { SyncButton, VerifyButton } from "@/src/components/AdminActions"
import { 
  Settings, 
  Rss, 
  BookOpen, 
  Users, 
  AlertTriangle,
  Database,
  Activity,
  Plus
} from "lucide-react"
import Link from "next/link"

// Componente para buscar estatísticas administrativas
async function AdminStatsSection() {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/stats`, {
      next: { revalidate: 60 } // Revalida a cada minuto
    })
    
    if (!response.ok) {
      throw new Error('Falha ao carregar estatísticas')
    }
    
    const data = await response.json()
    const stats = data.data

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total de Artigos"
          value={stats.totals.articles}
          description="No repositório"
          icon={BookOpen}
          color="blue"
        />
        <StatsCard
          title="Feeds Ativos"
          value={`${stats.totals.activeFeeds}/${stats.totals.feeds}`}
          description="Feeds funcionando"
          icon={Rss}
          color="green"
        />
        <StatsCard
          title="Autores"
          value={stats.totals.authors}
          description="Cadastrados"
          icon={Users}
          color="purple"
        />
        <StatsCard
          title="Hoje"
          value={stats.today.articles}
          description="Novos artigos"
          icon={Activity}
          color="orange"
        />
      </div>
    )
  } catch (error) {
    console.error('Erro ao carregar estatísticas:', error)
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }
}

export default function AdminDashboard() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Painel Administrativo
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Gerencie feeds, monitore sincronizações e administre o repositório
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

      {/* Estatísticas */}
      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      }>
        <AdminStatsSection />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ações Rápidas */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SyncButton />

                <Link href="/admin/feeds">
                  <Button 
                    variant="outline" 
                    className="justify-start h-auto p-4 w-full"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <Rss className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Gerenciar Feeds</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Adicionar, editar ou remover feeds
                        </div>
                      </div>
                    </div>
                  </Button>
                </Link>

                <Link href="/admin/repository">
                  <Button 
                    variant="outline" 
                    className="justify-start h-auto p-4 w-full"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                        <Database className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Limpar Repositório</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Arquivar ou remover artigos antigos
                        </div>
                      </div>
                    </div>
                  </Button>
                </Link>

                <VerifyButton />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status do Sistema */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Status do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Sincronização</span>
                <Badge variant="success">Ativa</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Banco de Dados</span>
                <Badge variant="success">Conectado</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Feeds com Erro</span>
                <Badge variant="outline">0</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Última Limpeza</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Há 3 dias
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Informações do Sistema */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="font-medium">Versão:</span> 1.0.0
              </div>
              <div>
                <span className="font-medium">Ambiente:</span> Desenvolvimento
              </div>
              <div>
                <span className="font-medium">Next.js:</span> 14.0.4
              </div>
              <SystemInfo />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Avisos e Notificações */}
      <div className="mt-8">
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
            <CardTitle className="text-blue-900 dark:text-blue-100 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Avisos Importantes
            </CardTitle>
          </CardHeader>
          <CardContent className="mt-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 shrink-0"></div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    Sistema em Desenvolvimento
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Esta é uma versão de desenvolvimento. Alguns recursos podem não estar completamente funcionais.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2 shrink-0"></div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    Backup Automático
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Configure backups regulares do banco de dados para ambientes de produção.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
