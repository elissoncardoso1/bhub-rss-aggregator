"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { RefreshCw } from "lucide-react"
import toast from "react-hot-toast"

interface FeedSyncButtonProps {
  feedId: string
}

export function FeedSyncButton({ feedId }: FeedSyncButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSync = async () => {
    if (isLoading) return
    
    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/admin/feeds/${feedId}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(`Sincronização concluída! ${result.data.addedArticles} novos artigos adicionados.`)
        // Recarrega a página para atualizar os dados
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
      size="sm"
      onClick={handleSync}
      disabled={isLoading}
    >
      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
    </Button>
  )
}
