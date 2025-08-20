"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { ArrowLeft, Save, TestTube } from "lucide-react"
import toast from "react-hot-toast"

export default function NewFeedPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    journalName: "",
    feedUrl: "",
    feedType: "RSS" as "RSS" | "RSS2" | "ATOM",
    country: "",
    language: "pt-BR",
    isActive: true,
    syncFrequency: 3600
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked 
             : type === 'number' ? parseInt(value) || 0 
             : value
    }))
  }

  const handleTestFeed = async () => {
    if (!formData.feedUrl) {
      toast.error("Digite a URL do feed primeiro")
      return
    }

    setIsTesting(true)
    try {
      const response = await fetch('/api/admin/feeds/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedUrl: formData.feedUrl })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(`Feed testado com sucesso! ${result.data.items_found} itens encontrados`)
        
        // Auto-preenche campos se possível
        if (result.data.feed_title && !formData.name) {
          setFormData(prev => ({
            ...prev,
            name: result.data.feed_title
          }))
        }
      } else {
        toast.error(result.message || 'Erro ao testar feed')
      }
    } catch (error) {
      console.error('Erro ao testar feed:', error)
      toast.error('Erro de conexão ao testar feed')
    } finally {
      setIsTesting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/feeds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Feed criado com sucesso!')
        router.push('/admin/feeds')
      } else {
        toast.error(result.message || 'Erro ao criar feed')
      }
    } catch (error) {
      console.error('Erro ao criar feed:', error)
      toast.error('Erro de conexão')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/admin/feeds">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900">
          Novo Feed RSS/Atom
        </h1>
        <p className="text-gray-600 mt-2">
          Adicione um novo feed para sincronização automática
        </p>
      </div>

      {/* Formulário */}
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Informações Básicas
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Feed *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Journal of Applied Behavior Analysis"
                />
              </div>

              <div>
                <label htmlFor="journalName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Periódico *
                </label>
                <input
                  type="text"
                  id="journalName"
                  name="journalName"
                  value={formData.journalName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: JABA"
                />
              </div>

              <div>
                <label htmlFor="feedUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  URL do Feed *
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    id="feedUrl"
                    name="feedUrl"
                    value={formData.feedUrl}
                    onChange={handleInputChange}
                    required
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/feed.xml"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTestFeed}
                    disabled={isTesting || !formData.feedUrl}
                  >
                    <TestTube className={`h-4 w-4 mr-2 ${isTesting ? 'animate-spin' : ''}`} />
                    {isTesting ? 'Testando...' : 'Testar'}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="feedType" className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo do Feed
                  </label>
                  <select
                    id="feedType"
                    name="feedType"
                    value={formData.feedType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="RSS">RSS</option>
                    <option value="RSS2">RSS 2.0</option>
                    <option value="ATOM">Atom</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                    Idioma
                  </label>
                  <select
                    id="language"
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (US)</option>
                    <option value="es-ES">Español</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                  País (opcional)
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Brasil, Estados Unidos"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Configurações de Sincronização
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="syncFrequency" className="block text-sm font-medium text-gray-700 mb-1">
                  Frequência de Sincronização (segundos)
                </label>
                <select
                  id="syncFrequency"
                  name="syncFrequency"
                  value={formData.syncFrequency}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={300}>5 minutos</option>
                  <option value={900}>15 minutos</option>
                  <option value={1800}>30 minutos</option>
                  <option value={3600}>1 hora</option>
                  <option value={7200}>2 horas</option>
                  <option value={21600}>6 horas</option>
                  <option value={43200}>12 horas</option>
                  <option value={86400}>24 horas</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Feed ativo (sincronização automática)
                </label>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 sm:flex-none"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Salvando...' : 'Salvar Feed'}
            </Button>
            
            <Link href="/admin/feeds">
              <Button variant="outline" type="button">
                Cancelar
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
