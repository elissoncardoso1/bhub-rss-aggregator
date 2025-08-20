"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Search, X } from "lucide-react"
import { debounce } from "@/src/lib/utils"
import Link from "next/link"

interface SearchSuggestion {
  articles: Array<{
    id: string
    title: string
    publicationDate?: Date | string | null
    category?: {
      name: string
      color: string
    } | null
  }>
  authors: Array<{
    id: string
    name: string
    articleCount: number
  }>
  categories: Array<{
    id: string
    name: string
    slug: string
    color: string
    articleCount: number
  }>
}

interface SearchBarProps {
  placeholder?: string
  onSearch?: (query: string) => void
  showSuggestions?: boolean
  className?: string
}

export function SearchBar({ 
  placeholder = "Buscar artigos, autores ou categorias...",
  onSearch,
  showSuggestions = true,
  className 
}: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<SearchSuggestion | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setSuggestions(null)
        setShowDropdown(false)
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`)
        const data = await response.json()
        
        if (data.success) {
          setSuggestions(data.data)
          setShowDropdown(true)
        }
      } catch (error) {
        console.error("Erro ao buscar sugestões:", error)
      } finally {
        setIsLoading(false)
      }
    }, 300),
    []
  )

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    
    if (showSuggestions) {
      debouncedSearch(value)
    }
  }

  // Handle search submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch?.(query.trim())
      setShowDropdown(false)
    }
  }

  // Clear search
  const handleClear = () => {
    setQuery("")
    setSuggestions(null)
    setShowDropdown(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const hasSuggestions = suggestions && (
    suggestions.articles.length > 0 || 
    suggestions.authors.length > 0 || 
    suggestions.categories.length > 0
  )

  return (
    <div ref={searchRef} className={`relative ${className || ""}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            className="pl-10 pr-20"
            onFocus={() => showSuggestions && hasSuggestions && setShowDropdown(true)}
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            <Button type="submit" size="sm" disabled={!query.trim()}>
              Buscar
            </Button>
          </div>
        </div>
      </form>

      {/* Dropdown de sugestões */}
      {showSuggestions && showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <Search className="h-4 w-4 animate-spin mx-auto mb-2" />
              Buscando...
            </div>
          ) : hasSuggestions ? (
            <div className="py-2">
              {/* Artigos */}
              {suggestions!.articles.length > 0 && (
                <div className="mb-4">
                  <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Artigos
                  </div>
                  {suggestions!.articles.map((article) => (
                    <Link
                      key={article.id}
                      href={`/articles/${article.id}`}
                      className="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <div className="font-medium text-sm line-clamp-1">{article.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        {article.category && (
                          <span 
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ 
                              backgroundColor: article.category.color + "20",
                              color: article.category.color 
                            }}
                          >
                            {article.category.name}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Autores */}
              {suggestions!.authors.length > 0 && (
                <div className="mb-4">
                  <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Autores
                  </div>
                  {suggestions!.authors.map((author) => (
                    <Link
                      key={author.id}
                      href={`/repository?author=${encodeURIComponent(author.name)}`}
                      className="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <div className="font-medium text-sm">{author.name}</div>
                      <div className="text-xs text-gray-500">
                        {author.articleCount} artigo{author.articleCount !== 1 ? "s" : ""}
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Categorias */}
              {suggestions!.categories.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Categorias
                  </div>
                  {suggestions!.categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/repository?category=${category.slug}`}
                      className="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium text-sm">{category.name}</span>
                      </div>
                      <div className="text-xs text-gray-500 ml-5">
                        {category.articleCount} artigo{category.articleCount !== 1 ? "s" : ""}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              Nenhum resultado encontrado para "{query}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
