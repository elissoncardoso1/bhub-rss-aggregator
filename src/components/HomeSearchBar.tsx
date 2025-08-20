"use client"

import { SearchBar } from "./SearchBar"

export function HomeSearchBar() {
  const handleSearch = (query: string) => {
    window.location.href = `/repository?q=${encodeURIComponent(query)}`
  }

  return (
    <SearchBar 
      placeholder="Buscar por artigos, autores ou temas..."
      onSearch={handleSearch}
    />
  )
}
