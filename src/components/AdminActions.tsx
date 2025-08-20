"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { RefreshCw, AlertTriangle } from "lucide-react"
import toast from "react-hot-toast"

export function SyncButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSync = async () => {
    if (isLoading) return
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/admin/sync-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(`Sincronização concluída! ${result.data.totalArticles} novos artigos de ${result.data.feedsProcessed} feeds.`)
        // Recarrega a página para atualizar as estatísticas
        window.location.reload()
      } else {
        toast.error(result.message || 'Erro na sincronização')
      }
    } catch (error) {
      console.error('Erro na sincronização:', error)
      toast.error('Erro de conexão. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      className="justify-start h-auto p-4"
      onClick={handleSync}
      disabled={isLoading}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
          <RefreshCw className={`h-5 w-5 text-blue-600 dark:text-blue-400 ${isLoading ? 'animate-spin' : ''}`} />
        </div>
        <div className="text-left">
          <div className="font-medium">
            {isLoading ? 'Sincronizando...' : 'Sincronizar Todos'}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Atualizar todos os feeds ativos
          </div>
        </div>
      </div>
    </Button>
  )
}

export function VerifyButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleVerify = async () => {
    if (isLoading) return
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/admin/feeds/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(`Verificação concluída! ${result.data.workingFeeds} feeds funcionando, ${result.data.brokenFeeds} com problemas.`)
      } else {
        toast.error(result.message || 'Erro na verificação')
      }
    } catch (error) {
      console.error('Erro na verificação:', error)
      toast.error('Erro de conexão. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      className="justify-start h-auto p-4"
      onClick={handleVerify}
      disabled={isLoading}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-orange-900/20 rounded-lg">
          <AlertTriangle className={`h-5 w-5 text-orange-600 dark:text-orange-400 ${isLoading ? 'animate-pulse' : ''}`} />
        </div>
        <div className="text-left">
          <div className="font-medium">
            {isLoading ? 'Verificando...' : 'Verificar Feeds'}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Testar conectividade de todos os feeds
          </div>
        </div>
      </div>
    </Button>
  )
}
