'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { GlobalSearchPalette } from './global-search-palette'

interface SearchContextValue {
  openSearch: () => void
}

const SearchContext = createContext<SearchContextValue>({ openSearch: () => {} })

export function useSearch() {
  return useContext(SearchContext)
}

export function AdminSearchProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  // Global keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const openSearch = useCallback(() => setOpen(true), [])

  return (
    <SearchContext.Provider value={{ openSearch }}>
      {children}
      <GlobalSearchPalette open={open} onOpenChange={setOpen} />
    </SearchContext.Provider>
  )
}
