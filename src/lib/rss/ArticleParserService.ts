import { stripHtml } from "@/src/lib/text"
import type Parser from "rss-parser"

export interface ParsedArticle {
  externalId: string
  title: string
  abstract: string
  url: string
  publicationDate: Date
  authors: string[]
  keywords: string[]
  doi: string | null
}

export class ArticleParserService {
  parseItem(item: Parser.Item, feed: { feedType: "RSS" | "RSS2" | "ATOM" }): ParsedArticle {
    return {
      externalId: this.extractId(item),
      title: (item.title || "").trim(),
      abstract: stripHtml(item.contentSnippet || item.content || item.summary || ""),
      url: this.extractUrl(item),
      publicationDate: this.extractDate(item),
      authors: this.extractAuthors(item),
      keywords: this.extractKeywords(item),
      doi: this.extractDoi(item),
    }
  }

  private extractId(item: Parser.Item): string {
    return (item.guid || (item as any).id || item.link) ?? crypto.randomUUID()
  }

  private extractUrl(item: Parser.Item): string {
    if (typeof item.link === "string") return item.link
    // @ts-ignore (alguns feeds trazem link como objeto)
    return item.link?.href ?? ""
  }

  private extractDate(item: Parser.Item): Date {
    const d = item.isoDate || item.pubDate
    const dt = d ? new Date(d) : new Date()
    return isNaN(+dt) ? new Date() : dt
  }

  private extractAuthors(item: Parser.Item): string[] {
    const authors: string[] = []
    
    // Tenta extrair de diferentes campos
    if (Array.isArray(item.creator)) {
      authors.push(...item.creator.map(String))
    } else if (item.creator) {
      authors.push(String(item.creator))
    }
    
    if (Array.isArray((item as any).author)) {
      authors.push(...(item as any).author.map(String))
    } else if ((item as any).author) {
      authors.push(String((item as any).author))
    }
    
    // @ts-ignore - alguns feeds têm campos customizados
    if ((item as any)["dc:creator"]) {
      const dcCreator = (item as any)["dc:creator"]
      if (Array.isArray(dcCreator)) {
        authors.push(...dcCreator.map(String))
      } else {
        authors.push(String(dcCreator))
      }
    }
    
    // Fallback removido: extrair nomes do título é muito impreciso
    // e pode capturar palavras que não são nomes de autores
    
    // Remove duplicatas e valores vazios
    const uniqueAuthors = new Set(authors.filter(a => a.trim().length > 0))
    return Array.from(uniqueAuthors)
  }

  private extractKeywords(item: Parser.Item): string[] {
    const keywords: string[] = []
    
    // @ts-ignore - alguns feeds têm campos customizados
    if ((item as any)["dc:subject"]) {
      const dcSubject = (item as any)["dc:subject"]
      if (Array.isArray(dcSubject)) {
        keywords.push(...dcSubject.map(String))
      } else {
        keywords.push(String(dcSubject))
      }
    }
    
    // @ts-ignore - alguns feeds têm campo tags
    if ((item as any).tags) {
      const tags = (item as any).tags
      if (Array.isArray(tags)) {
        keywords.push(...tags.map(String))
      } else {
        keywords.push(String(tags))
      }
    }
    
    // Remove duplicatas e valores vazios
    const uniqueKeywords = new Set(keywords.filter(k => k.trim().length > 0))
    return Array.from(uniqueKeywords)
  }

  private extractDoi(item: Parser.Item): string | null {
    // Campos onde DOI pode aparecer
    const textFields = [
      item.title,
      item.content,
      item.contentSnippet,
      item.link,
      item.guid,
      // @ts-ignore
      item["prism:doi"],
      // @ts-ignore
      item["dc:identifier"]
    ].filter(Boolean)
    
    const text = textFields.join(" ")
    
    // Padrões de DOI mais comuns
    const doiPatterns = [
      /doi:?\s*(10\.\d+\/[^\s<>"']+)/i,
      /https?:\/\/(?:dx\.)?doi\.org\/(10\.\d+\/[^\s<>"']+)/i,
      /(10\.\d{4,}\/[^\s<>"']+)/i
    ]
    
    for (const pattern of doiPatterns) {
      const match = text.match(pattern)
      if (match) {
        let doi = match[1].trim()
        // Remove caracteres de pontuação no final
        doi = doi.replace(/[.,;:)]+$/, "")
        return doi
      }
    }
    
    return null
  }
}
