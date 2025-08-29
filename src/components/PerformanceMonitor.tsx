'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react'

interface PerformanceMetrics {
  lcp: number | null // Largest Contentful Paint
  fid: number | null // First Input Delay  
  cls: number | null // Cumulative Layout Shift
  fcp: number | null // First Contentful Paint
  ttfb: number | null // Time to First Byte
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null
  })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
      return
    }

    let observer: PerformanceObserver | null = null

    try {
      // Observar Web Vitals
      observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          switch (entry.entryType) {
            case 'largest-contentful-paint':
              setMetrics(prev => ({ ...prev, lcp: entry.startTime }))
              break
            case 'first-input':
              setMetrics(prev => ({ ...prev, fid: (entry as any).processingStart - entry.startTime }))
              break
            case 'layout-shift':
              if (!(entry as any).hadRecentInput) {
                setMetrics(prev => ({ ...prev, cls: (prev.cls || 0) + (entry as any).value }))
              }
              break
            case 'paint':
              if (entry.name === 'first-contentful-paint') {
                setMetrics(prev => ({ ...prev, fcp: entry.startTime }))
              }
              break
            case 'navigation':
              const navEntry = entry as PerformanceNavigationTiming
              setMetrics(prev => ({ ...prev, ttfb: navEntry.responseStart - navEntry.requestStart }))
              break
          }
        }
      })

      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift', 'paint', 'navigation'] })
    } catch (error) {
      console.warn('Performance Observer não suportado:', error)
    }

    return () => {
      if (observer) {
        observer.disconnect()
      }
    }
  }, [])

  const getScoreColor = (metric: string, value: number) => {
    switch (metric) {
      case 'lcp':
        return value <= 2500 ? 'text-green-600' : value <= 4000 ? 'text-yellow-600' : 'text-red-600'
      case 'fid':
        return value <= 100 ? 'text-green-600' : value <= 300 ? 'text-yellow-600' : 'text-red-600'
      case 'cls':
        return value <= 0.1 ? 'text-green-600' : value <= 0.25 ? 'text-yellow-600' : 'text-red-600'
      case 'fcp':
        return value <= 1800 ? 'text-green-600' : value <= 3000 ? 'text-yellow-600' : 'text-red-600'
      case 'ttfb':
        return value <= 800 ? 'text-green-600' : value <= 1800 ? 'text-yellow-600' : 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const formatValue = (metric: string, value: number) => {
    switch (metric) {
      case 'cls':
        return value.toFixed(3)
      case 'lcp':
      case 'fcp':
      case 'ttfb':
        return `${Math.round(value)}ms`
      case 'fid':
        return `${Math.round(value)}ms`
      default:
        return Math.round(value).toString()
    }
  }

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <>
      {/* Botão Toggle */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Monitor de Performance"
      >
        <Zap className="h-5 w-5" />
      </button>

      {/* Panel de Métricas */}
      {isVisible && (
        <div className="fixed bottom-16 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-80">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Performance Monitor
          </h3>
          
          <div className="space-y-2 text-sm">
            {[
              { key: 'lcp', label: 'LCP (Largest Contentful Paint)', icon: <Clock className="h-4 w-4" /> },
              { key: 'fcp', label: 'FCP (First Contentful Paint)', icon: <Clock className="h-4 w-4" /> },
              { key: 'fid', label: 'FID (First Input Delay)', icon: <Clock className="h-4 w-4" /> },
              { key: 'cls', label: 'CLS (Cumulative Layout Shift)', icon: <AlertTriangle className="h-4 w-4" /> },
              { key: 'ttfb', label: 'TTFB (Time to First Byte)', icon: <Clock className="h-4 w-4" /> }
            ].map(({ key, label, icon }) => {
              const value = metrics[key as keyof PerformanceMetrics]
              return (
                <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    {icon}
                    <span className="text-gray-700">{label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {value !== null ? (
                      <>
                        <span className={`font-mono ${getScoreColor(key, value)}`}>
                          {formatValue(key, value)}
                        </span>
                        {value <= (key === 'cls' ? 0.1 : key === 'fid' ? 100 : key === 'lcp' ? 2500 : key === 'fcp' ? 1800 : 800) ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        )}
                      </>
                    ) : (
                      <span className="text-gray-400">Aguardando...</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              🟢 Bom | 🟡 Precisa melhorar | 🔴 Ruim
            </p>
          </div>
        </div>
      )}
    </>
  )
}
