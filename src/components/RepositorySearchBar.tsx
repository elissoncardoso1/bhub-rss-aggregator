"use client"

import { SearchBar } from "./SearchBar"

interface RepositorySearchBarProps {
  searchParams: {
    q?: string
    category?: string
    feed?: string
    author?: string
    year?: string
    page?: string
  }
}

export function RepositorySearchBar({ searchParams }: RepositorySearchBarProps) {
  const handleSearch = (query: string) => {
    const params = new URLSearchParams()
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== 'q' && key !== 'page') {
        params.set(key, value)
      }
    })
    if (query.trim()) {
      params.set('q', query.trim())
    }
    window.location.href = `/repository?${params.toString()}`
  }

  return (
    <SearchBar
      placeholder="Buscar por título, autor ou palavras-chave..."
      onSearch={handleSearch}
      showSuggestions={false}
    />
  )
}
