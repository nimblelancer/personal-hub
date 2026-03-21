'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Bookmark, FolderKanban, Map, Loader2 } from 'lucide-react'
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'
import { globalSearch, type SearchResultItem } from '@/lib/actions/global-search-actions'

const TYPE_LABELS: Record<SearchResultItem['type'], string> = {
  note: 'Notes',
  bookmark: 'Bookmarks',
  project: 'Projects',
  roadmap: 'Roadmaps',
}

const TYPE_ICONS: Record<SearchResultItem['type'], React.ReactNode> = {
  note: <BookOpen className="h-4 w-4 text-emerald-500" />,
  bookmark: <Bookmark className="h-4 w-4 text-cyan-500" />,
  project: <FolderKanban className="h-4 w-4 text-violet-500" />,
  roadmap: <Map className="h-4 w-4 text-amber-500" />,
}

const TYPES: SearchResultItem['type'][] = ['note', 'bookmark', 'project', 'roadmap']

interface GlobalSearchPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GlobalSearchPalette({ open, onOpenChange }: GlobalSearchPaletteProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [loading, setLoading] = useState(false)

  // Debounced search — cancelled flag prevents stale responses from overwriting current results
  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }
    let cancelled = false
    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        const items = await globalSearch(query)
        if (!cancelled) setResults(items)
      } catch {
        if (!cancelled) setResults([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query])

  // Reset state when closed
  useEffect(() => {
    if (!open) {
      setQuery('')
      setResults([])
    }
  }, [open])

  const handleSelect = useCallback(
    (href: string) => {
      onOpenChange(false)
      router.push(href)
    },
    [router, onOpenChange]
  )

  const grouped = TYPES.reduce<Record<string, SearchResultItem[]>>((acc, type) => {
    const items = results.filter((r) => r.type === type)
    if (items.length > 0) acc[type] = items
    return acc
  }, {})

  const hasResults = results.length > 0

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Global Search" shouldFilter={false}>
      <CommandInput
        placeholder="Search notes, bookmarks, projects, roadmaps..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {loading && (
          <div className="flex items-center justify-center py-6 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm">Searching...</span>
          </div>
        )}
        {!loading && query.length >= 2 && !hasResults && (
          <CommandEmpty>No results for &ldquo;{query}&rdquo;</CommandEmpty>
        )}
        {!loading && query.length < 2 && (
          <div role="status" className="py-6 text-center text-sm text-muted-foreground">
            Type 2+ characters to search
          </div>
        )}
        {!loading && hasResults && Object.entries(grouped).map(([type, items]) => (
          <CommandGroup key={type} heading={TYPE_LABELS[type as SearchResultItem['type']]}>
            {items.map((item) => (
              <CommandItem
                key={item.id}
                value={`${item.type}-${item.id}-${item.title}`}
                onSelect={() => handleSelect(item.href)}
                className="flex items-start gap-2 cursor-pointer"
              >
                <span className="mt-0.5 shrink-0">
                  {TYPE_ICONS[item.type as SearchResultItem['type']]}
                </span>
                <span className="flex flex-col min-w-0">
                  <span className="truncate font-medium text-sm">{item.title}</span>
                  {item.subtitle && (
                    <span className="truncate text-xs text-muted-foreground">{item.subtitle}</span>
                  )}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  )
}
