'use client'

import React, { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

interface BannerModalProps {
  onBannerCreated: () => void
}

interface BannerFormData {
  title: string
  imageUrl: string
  linkUrl: string
  htmlContent: string
  position: 'HEADER' | 'SIDEBAR' | 'BETWEEN_ARTICLES' | 'FOOTER'
  isActive: boolean
  priority: number
  startDate: string
  endDate: string
}

function BannerModal({ onBannerCreated }: BannerModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<BannerFormData>({
    title: '',
    imageUrl: '',
    linkUrl: '',
    htmlContent: '',
    position: 'HEADER',
    isActive: true,
    priority: 0,
    startDate: '',
    endDate: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null
        })
      })

      if (response.ok) {
        setOpen(false)
        setFormData({
          title: '',
          imageUrl: '',
          linkUrl: '',
          htmlContent: '',
          position: 'HEADER',
          isActive: true,
          priority: 0,
          startDate: '',
          endDate: ''
        })
        onBannerCreated()
      } else {
        console.error('Erro ao criar banner')
      }
    } catch (error) {
      console.error('Erro ao criar banner:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof BannerFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Novo Banner
      </Button>
    )
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Novo Banner
      </Button>
      
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Criar Novo Banner</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Nome do banner"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="position">Posição *</Label>
                    <select 
                      value={formData.position} 
                      onChange={(e) => handleInputChange('position', e.target.value as 'HEADER' | 'SIDEBAR' | 'BETWEEN_ARTICLES' | 'FOOTER')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="HEADER">Cabeçalho</option>
                      <option value="SIDEBAR">Barra Lateral</option>
                      <option value="BETWEEN_ARTICLES">Entre Artigos</option>
                      <option value="FOOTER">Rodapé</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">URL da Imagem</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                    placeholder="https://exemplo.com/imagem.jpg"
                    type="url"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkUrl">URL de Destino</Label>
                  <Input
                    id="linkUrl"
                    value={formData.linkUrl}
                    onChange={(e) => handleInputChange('linkUrl', e.target.value)}
                    placeholder="https://exemplo.com"
                    type="url"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="htmlContent">Conteúdo HTML (opcional)</Label>
                  <textarea
                    id="htmlContent"
                    value={formData.htmlContent}
                    onChange={(e) => handleInputChange('htmlContent', e.target.value)}
                    placeholder="<div>Conteúdo HTML personalizado</div>"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioridade</Label>
                    <Input
                      id="priority"
                      type="number"
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Data de Início</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Data de Fim</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="isActive">Banner ativo</Label>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading || !formData.title}>
                    {loading ? 'Criando...' : 'Criar Banner'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>  )
}

export default BannerModal