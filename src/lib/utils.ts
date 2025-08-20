import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata data para exibição
 */
export function formatDate(date: Date | string | null): string {
  if (!date) return "Data não disponível"
  
  const d = typeof date === "string" ? new Date(date) : date
  
  if (isNaN(d.getTime())) return "Data inválida"
  
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(d)
}

/**
 * Formata data apenas (sem hora)
 */
export function formatDateOnly(date: Date | string | null): string {
  if (!date) return "Data não disponível"
  
  const d = typeof date === "string" ? new Date(date) : date
  
  if (isNaN(d.getTime())) return "Data inválida"
  
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(d)
}

/**
 * Formata data relativa (ex: "há 2 dias")
 */
export function formatRelativeDate(date: Date | string | null): string {
  if (!date) return "Data não disponível"
  
  const d = typeof date === "string" ? new Date(date) : date
  
  if (isNaN(d.getTime())) return "Data inválida"
  
  const now = new Date()
  const diffInMs = now.getTime() - d.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return "Hoje"
  if (diffInDays === 1) return "Ontem"
  if (diffInDays < 7) return `Há ${diffInDays} dias`
  if (diffInDays < 30) return `Há ${Math.floor(diffInDays / 7)} semanas`
  if (diffInDays < 365) return `Há ${Math.floor(diffInDays / 30)} meses`
  
  return `Há ${Math.floor(diffInDays / 365)} anos`
}

/**
 * Formata números grandes (ex: 1.2K, 1.5M)
 */
export function formatNumber(num: number): string {
  if (num < 1000) return num.toString()
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`
  return `${(num / 1000000).toFixed(1)}M`
}

/**
 * Trunca texto preservando palavras
 */
export function truncateText(text: string, maxLength: number = 150): string {
  if (!text || text.length <= maxLength) return text
  
  const truncated = text.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(" ")
  
  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace) + "..."
  }
  
  return truncated + "..."
}

/**
 * Gera cor baseada em string (para avatars, badges, etc.)
 */
export function stringToColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  const hue = hash % 360
  return `hsl(${hue}, 70%, 50%)`
}

/**
 * Debounce function para search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
