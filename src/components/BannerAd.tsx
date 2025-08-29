'use client'

import { useEffect, useState } from 'react'
import AdSense from 'react-adsense'
import { cn } from '@/src/lib/utils'
import { Megaphone, Image, Link } from 'lucide-react'

interface Banner {
  id: string
  title: string
  imageUrl?: string
  linkUrl?: string
  htmlContent?: string
  position: 'HEADER' | 'SIDEBAR' | 'BETWEEN_ARTICLES' | 'FOOTER'
  isActive: boolean
  priority: number
}

// Componente principal para banners
interface BannerAdProps {
  position: 'header' | 'sidebar' | 'between-articles' | 'footer'
  className?: string
  adsenseClient?: string
  adsenseSlot?: string
  maxBanners?: number
  showPlaceholder?: boolean // Nova prop para controlar se mostra placeholder
}

export function BannerAd({ 
  position, 
  className, 
  adsenseClient,
  adsenseSlot,
  maxBanners = 1,
  showPlaceholder = true // Por padrão, mostra placeholder
}: BannerAdProps) {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      fetchBanners()
    }
  }, [position, mounted]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchBanners = async () => {
    try {
      const response = await fetch(`/api/banners/${position.toUpperCase()}?limit=${maxBanners}`)
      if (response.ok) {
        const data = await response.json()
        setBanners(data.banners || [])
      }
    } catch (error) {
      console.error('Erro ao carregar banners:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBannerClick = async (bannerId: string) => {
    try {
      await fetch(`/api/banners/${bannerId}/click`, { method: 'POST' })
    } catch (error) {
      console.error('Erro ao registrar clique:', error)
    }
  }

  const getResponsiveStyles = () => {
    switch (position) {
      case 'header':
        return cn(
          'w-full h-16 sm:h-20 lg:h-24 flex items-center justify-center'
        )
      case 'sidebar':
        return cn(
          'w-full max-w-xs h-32 lg:h-64 sticky top-4'
        )
      case 'between-articles':
        return cn(
          'w-full h-20 lg:h-24 my-8 flex items-center justify-center'
        )
      case 'footer':
        return cn(
          'w-full h-16 lg:h-20 flex items-center justify-center'
        )
      default:
        return 'w-full'
    }
  }

  // Componente de placeholder para indicar espaço disponível
  const BannerPlaceholder = () => {
    const getPlaceholderContent = () => {
      switch (position) {
        case 'header':
          return {
            icon: <Megaphone className="h-6 w-6 text-blue-400" />,
            title: 'Espaço para Banner',
            subtitle: 'Header - Área de destaque principal',
            bgColor: 'bg-gradient-to-r from-blue-50 to-indigo-50',
            borderColor: 'border-blue-200'
          }
        case 'sidebar':
          return {
            icon: <Image className="h-6 w-6 text-green-400" />,
            title: 'Banner Lateral',
            subtitle: 'Sidebar - Área de promoção',
            bgColor: 'bg-gradient-to-r from-green-50 to-emerald-50',
            borderColor: 'border-green-200'
          }
        case 'between-articles':
          return {
            icon: <Link className="h-6 w-6 text-purple-400" />,
            title: 'Banner Entre Artigos',
            subtitle: 'Área de conexão e promoção',
            bgColor: 'bg-gradient-to-r from-purple-50 to-pink-50',
            borderColor: 'border-purple-200'
          }
        case 'footer':
          return {
            icon: <Megaphone className="h-6 w-6 text-orange-400" />,
            title: 'Banner Rodapé',
            subtitle: 'Footer - Área de encerramento',
            bgColor: 'bg-gradient-to-r from-orange-50 to-red-50',
            borderColor: 'border-orange-200'
          }
        default:
          return {
            icon: <Megaphone className="h-6 w-6 text-gray-400" />,
            title: 'Espaço para Banner',
            subtitle: 'Área disponível para publicidade',
            bgColor: 'bg-gradient-to-r from-gray-50 to-slate-50',
            borderColor: 'border-gray-200'
          }
      }
    }

    const content = getPlaceholderContent()

    return (
      <div className={cn(
        'w-full h-full rounded-lg border-2 border-dashed',
        content.bgColor,
        content.borderColor,
        'flex flex-col items-center justify-center p-4 text-center',
        'hover:border-solid hover:shadow-sm transition-all duration-200'
      )}>
        <div className="mb-2">
          {content.icon}
        </div>
        <h3 className="font-medium text-gray-700 text-sm mb-1">
          {content.title}
        </h3>
        <p className="text-xs text-gray-500 mb-2">
          {content.subtitle}
        </p>
        <div className="text-xs text-gray-400 bg-white/50 px-2 py-1 rounded-full">
          Disponível para banners
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={cn(getResponsiveStyles(), className, 'animate-pulse bg-gray-200 rounded')} />
    )
  }

  // Se não há banners customizados e há configuração AdSense, mostrar AdSense
  if (banners.length === 0 && adsenseClient && adsenseSlot) {
    return (
      <div className={cn(getResponsiveStyles(), className)}>
        <AdSense.Google
          client={adsenseClient}
          slot={adsenseSlot}
          style={{ display: 'block' }}
          format="auto"
          responsive="true"
        />
      </div>
    )
  }

  // Se não há banners e showPlaceholder é true, mostrar placeholder
  if (banners.length === 0 && showPlaceholder) {
    return (
      <div className={cn(getResponsiveStyles(), className)}>
        <BannerPlaceholder />
      </div>
    )
  }

  // Se não há banners e não deve mostrar placeholder, retornar null
  if (banners.length === 0) {
    return null
  }

  return (
    <div className={cn(getResponsiveStyles(), className)}>
      {banners.map((banner) => (
        <div key={banner.id} className="w-full h-full">
          {banner.htmlContent ? (
            <div 
              dangerouslySetInnerHTML={{ __html: banner.htmlContent }}
              className="w-full h-full flex items-center justify-center"
            />
          ) : banner.imageUrl ? (
            <a
              href={banner.linkUrl || '#'}
              target={banner.linkUrl ? '_blank' : '_self'}
              rel="noopener noreferrer"
              onClick={() => handleBannerClick(banner.id)}
              className="block w-full h-full"
            >
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="w-full h-full object-cover rounded"
              />
            </a>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded">
              <span className="text-gray-500 text-sm">{banner.title}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}