import Image from 'next/image'
import { BookOpen, ExternalLink, ImageOff } from 'lucide-react'
import { type UnsplashImage } from '@/src/lib/unsplash'
import { useState } from 'react'

interface UnsplashImageProps {
  image: UnsplashImage | null
  loading: boolean
  error: boolean
  className?: string
  width?: number
  height?: number
  priority?: boolean
  showAttribution?: boolean
}

export function UnsplashImage({
  image,
  loading,
  error,
  className = '',
  width = 400,
  height = 250,
  priority = false,
  showAttribution = true
}: UnsplashImageProps) {
  const [imageError, setImageError] = useState(false)

  // Estado de carregamento
  if (loading) {
    return (
      <div 
        className={`bg-gray-200 animate-pulse flex items-center justify-center rounded-lg ${className}`}
        style={{ width, height }}
      >
        <BookOpen className="h-8 w-8 text-gray-400" />
      </div>
    )
  }

  // Estado de erro ou sem imagem
  if (error || !image || imageError) {
    return (
      <div 
        className={`bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 ${className}`}
        style={{ width, height }}
      >
        <ImageOff className="h-8 w-8 text-gray-400 mb-2" />
        <span className="text-xs text-gray-500 text-center px-2">
          Imagem não disponível
        </span>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      <Image
        src={image.urls.regular}
        alt={image.alt_description || image.description || 'Imagem do artigo'}
        width={width}
        height={height}
        priority={priority}
        className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
        onError={() => setImageError(true)}
        loading={priority ? "eager" : "lazy"}
      />
      
      {showAttribution && (
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2">
          <div className="flex items-center justify-between">
            <span className="truncate">
              Foto por{' '}
              <a
                href={`https://unsplash.com/@${image.user.username}?utm_source=bhub&utm_medium=referral`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-gray-300"
              >
                {image.user.name}
              </a>
            </span>
            <a
              href={`${image.links.html}?utm_source=bhub&utm_medium=referral`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 hover:text-gray-300"
              title="Ver no Unsplash"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

// Componente simplificado para casos onde não precisamos de atribuição
export function SimpleUnsplashImage(props: Omit<UnsplashImageProps, 'showAttribution'>) {
  return <UnsplashImage {...props} showAttribution={false} />
}