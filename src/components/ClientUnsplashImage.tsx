"use client"

import { useState, useEffect } from 'react'
import { UnsplashImage } from './UnsplashImage'
import { unsplashService, type UnsplashImage as UnsplashImageType } from '@/src/lib/unsplash'

interface ClientUnsplashImageProps {
  title: string
  category?: string
  keywords?: string[]
  className?: string
  width?: number
  height?: number
  priority?: boolean
  showAttribution?: boolean
}

export function ClientUnsplashImage({
  title,
  category,
  keywords,
  className = '',
  width = 400,
  height = 250,
  priority = false,
  showAttribution = true
}: ClientUnsplashImageProps) {
  const [image, setImage] = useState<UnsplashImageType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Detect when component is mounted on client
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !title) {
      return
    }
    
    let isMounted = true

    const loadImage = async () => {
      try {
        setLoading(true)
        setError(false)
        
        const result = await unsplashService.getImageForArticle(
          title,
          category,
          keywords
        )
        
        if (isMounted) {
          setImage(result)
          setLoading(false)
        }
      } catch (err) {
        console.error('Error loading Unsplash image:', err)
        if (isMounted) {
          setError(true)
          setLoading(false)
        }
      }
    }

    loadImage()

    return () => {
      isMounted = false
    }
  }, [title, category, keywords, mounted])

  return (
    <UnsplashImage
      image={image}
      loading={loading}
      error={error}
      className={className}
      width={width}
      height={height}
      priority={priority}
      showAttribution={showAttribution}
    />
  )
}