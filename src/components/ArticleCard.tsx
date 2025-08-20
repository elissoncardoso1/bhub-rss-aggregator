import Link from "next/link"
import { formatDateOnly, truncateText } from "@/src/lib/utils"
import { ExternalLink, Calendar, User, BookOpen, Eye, Clock } from "lucide-react"
import { TranslatableText } from "@/src/components/TranslatableText"

interface ArticleCardProps {
  article: {
    id: string
    title: string
    abstract?: string | null
    publicationDate?: Date | string | null
    originalUrl?: string | null
    feedName: string
    journalName: string
    category?: {
      name: string
      color: string
    } | null
    authors: string[]
    viewCount?: number
  }
  variant?: 'main' | 'secondary' | 'small' | 'sidebar'
  showImage?: boolean
  className?: string
}

export function ArticleCard({ article, variant = 'secondary', showImage = false, className }: ArticleCardProps) {
  const displayAuthors = article.authors.slice(0, 2)
  const remainingAuthors = article.authors.length - 2

  // Diferentes layouts baseados na variante
  if (variant === 'main') {
    return (
      <article className={`journal-card-main ${className || ""} transition-all duration-300 hover:-translate-y-1`}>
        {showImage && (
          <div className="w-full h-48 md:h-64 bg-gray-200 mb-4 flex items-center justify-center rounded-lg overflow-hidden">
            <BookOpen className="h-16 w-16 text-gray-400" />
          </div>
        )}
        
        {article.category && (
          <div className="mb-2">
            <span 
              className="journal-category-badge"
              style={{ backgroundColor: article.category.color }}
            >
              {article.category.name}
            </span>
          </div>
        )}
        
        <Link href={`/articles/${article.id}`} className="block group">
          <h1 className="journal-headline-main group-hover:text-red-600 transition-colors mb-3">
            {article.title}
          </h1>
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4 text-sm">
          <span className="journal-date flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {article.publicationDate && formatDateOnly(article.publicationDate)}
          </span>
          <span className="journal-author flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            {article.journalName}
          </span>
          {article.authors.length > 0 && (
            <span className="journal-author flex items-center gap-1">
              <User className="h-4 w-4" />
              Por {displayAuthors.join(", ")}
              {remainingAuthors > 0 && ` +${remainingAuthors}`}
            </span>
          )}
          {article.viewCount && (
            <span className="flex items-center gap-1 text-gray-500">
              <Eye className="h-4 w-4" />
              {article.viewCount} visualizações
            </span>
          )}
        </div>
        
        {article.abstract && (
          <div className="journal-excerpt text-base mb-4">
            <TranslatableText
              text={article.abstract}
              truncateLength={300}
              variant="block"
              showTranslateButton={true}
            />
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <Link
            href={`/articles/${article.id}`}
            className="inline-block px-4 py-2 bg-red-600 text-white font-medium hover:bg-red-700 transition-colors w-full sm:w-auto text-center rounded-md hover:scale-105 transform duration-200"
          >
            Ler artigo completo
          </Link>
          
          {article.originalUrl && (
            <a
              href={article.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition-colors hover:scale-105 transform duration-200"
            >
              <ExternalLink className="h-4 w-4" />
              Ver original
            </a>
          )}
        </div>
      </article>
    )
  }

  if (variant === 'small' || variant === 'sidebar') {
    return (
      <article className={`journal-card-small ${className || ""} transition-all duration-300 hover:-translate-y-1`}>
        <div className="flex gap-3">
          {showImage && (
            <div className="w-16 h-16 bg-gray-200 flex-shrink-0 flex items-center justify-center rounded-md">
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            {article.category && (
              <span 
                className="journal-category-badge text-xs mb-1 inline-block"
                style={{ backgroundColor: article.category.color }}
              >
                {article.category.name}
              </span>
            )}
            
            <Link href={`/articles/${article.id}`} className="block group">
              <h3 className="journal-headline text-sm leading-tight group-hover:text-red-600 transition-colors mb-1 line-clamp-2">
                {article.title}
              </h3>
            </Link>
            
            <div className="text-xs text-gray-500 mb-1">
              <span className="journal-date flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {article.publicationDate && formatDateOnly(article.publicationDate)}
              </span>
              <span className="mx-1">•</span>
              <span className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {article.journalName}
              </span>
            </div>
            
            {article.authors.length > 0 && (
              <div className="text-xs text-gray-600 flex items-center gap-1">
                <User className="h-3 w-3" />
                {displayAuthors.join(", ")}
                {remainingAuthors > 0 && ` +${remainingAuthors}`}
              </div>
            )}
          </div>
        </div>
      </article>
    )
  }

  // Variante 'secondary' - padrão
  return (
    <article className={`journal-card-secondary ${className || ""} transition-all duration-300 hover:-translate-y-1`}>
      <div className="flex flex-col sm:flex-row gap-4">
        {showImage && (
          <div className="w-full sm:w-32 h-24 sm:h-24 bg-gray-200 flex-shrink-0 flex items-center justify-center rounded-md">
            <BookOpen className="h-8 w-8 text-gray-400" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          {article.category && (
            <div className="mb-2">
              <span 
                className="journal-category-badge"
                style={{ backgroundColor: article.category.color }}
              >
                {article.category.name}
              </span>
            </div>
          )}
          
          <Link href={`/articles/${article.id}`} className="block group">
            <h2 className="journal-headline-secondary group-hover:text-red-600 transition-colors mb-2 line-clamp-2">
              {article.title}
            </h2>
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-3 text-sm">
            <span className="journal-date flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {article.publicationDate && formatDateOnly(article.publicationDate)}
            </span>
            <span className="journal-author flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {article.journalName}
            </span>
            {article.authors.length > 0 && (
              <span className="journal-author flex items-center gap-1">
                <User className="h-4 w-4" />
                {displayAuthors.join(", ")}
                {remainingAuthors > 0 && ` +${remainingAuthors}`}
              </span>
            )}
          </div>
          
          {article.abstract && (
            <div className="journal-excerpt text-sm mb-3">
              <TranslatableText
                text={article.abstract}
                truncateLength={150}
                variant="block"
                showTranslateButton={true}
              />
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <Link
              href={`/articles/${article.id}`}
              className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors hover:scale-105 transform duration-200"
            >
              Ler mais →
            </Link>
            
            {article.originalUrl && (
              <a
                href={article.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 transition-colors hover:scale-105 transform duration-200"
              >
                <ExternalLink className="h-3 w-3" />
                Original
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
