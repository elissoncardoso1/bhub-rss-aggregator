/**
 * Utilitários para manipulação de texto
 */

/**
 * Remove tags HTML de uma string e normaliza espaços
 */
export function stripHtml(html: string): string {
  if (!html) return ""
  
  // Remove tags HTML
  const withoutTags = html.replace(/<[^>]*>/g, "")
  
  // Decodifica entidades HTML básicas
  const decoded = withoutTags
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
  
  // Normaliza espaços em branco
  return decoded.replace(/\s+/g, " ").trim()
}

/**
 * Normaliza nome de autor para busca
 */
export function normalizeAuthorName(name: string): string {
  if (!name) return ""
  
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // Remove pontuação
    .replace(/\s+/g, " ") // Normaliza espaços
    .trim()
}

/**
 * Trunca texto mantendo palavras inteiras
 */
export function truncateText(text: string, maxLength: number = 200): string {
  if (!text || text.length <= maxLength) return text
  
  const truncated = text.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(" ")
  
  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace) + "..."
  }
  
  return truncated + "..."
}

/**
 * Gera slug a partir de texto
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^\w\s-]/g, "") // Remove caracteres especiais
    .replace(/\s+/g, "-") // Substitui espaços por hífens
    .replace(/-+/g, "-") // Remove hífens duplicados
    .trim()
}

/**
 * Extrai palavras-chave de um texto
 */
export function extractKeywords(text: string, minLength: number = 3): string[] {
  if (!text) return []
  
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(word => word.length >= minLength)
  
  // Remove palavras comuns (stopwords básicas)
  const stopwords = new Set([
    "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by",
    "a", "an", "is", "are", "was", "were", "be", "been", "have", "has", "had",
    "do", "does", "did", "will", "would", "could", "should", "may", "might",
    "o", "a", "os", "as", "um", "uma", "uns", "umas", "de", "da", "do", "das", "dos",
    "em", "na", "no", "nas", "nos", "para", "por", "com", "sem", "sobre", "entre",
    "é", "são", "foi", "foram", "ser", "estar", "ter", "haver", "fazer"
  ])
  
  const filtered = words.filter(word => !stopwords.has(word))
  
  // Remove duplicatas e retorna
  return Array.from(new Set(filtered))
}
