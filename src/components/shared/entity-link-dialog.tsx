'use client'
import type { ReactNode } from 'react'
import { useState, useEffect, useCallback } from 'react'
import { BookOpen, FolderOpen, Bookmark, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { createEntityLink, searchEntities } from '@/lib/actions/entity-link-actions'
import type { EntityType } from '@/types/database'
import type { SearchResult } from '@/lib/actions/entity-link-actions'

const TYPE_ICON: Record<string, ReactNode> = {
  note: <BookOpen className="size-3.5 shrink-0" />,
  project: <FolderOpen className="size-3.5 shrink-0" />,
  bookmark: <Bookmark className="size-3.5 shrink-0" />,
}

const TYPE_LABEL: Record<string, string> = {
  note: 'Notes',
  project: 'Projects',
  bookmark: 'Bookmarks',
}

interface EntityLinkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entityType: EntityType
  entityId: string
}

export function EntityLinkDialog({
  open,
  onOpenChange,
  entityType,
  entityId,
}: EntityLinkDialogProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [linking, setLinking] = useState<string | null>(null)

  const runSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) { setResults([]); return }
      setLoading(true)
      try {
        const data = await searchEntities(q, entityType, entityId)
        setResults(data)
      } finally {
        setLoading(false)
      }
    },
    [entityType, entityId]
  )

  // Debounce 300ms
  useEffect(() => {
    const timer = setTimeout(() => runSearch(query), 300)
    return () => clearTimeout(timer)
  }, [query, runSearch])

  // Reset on open
  useEffect(() => {
    if (open) { setQuery(''); setResults([]) }
  }, [open])

  async function handleSelect(result: SearchResult) {
    setLinking(result.id)
    try {
      await createEntityLink(entityType, entityId, result.type, result.id)
      onOpenChange(false)
    } finally {
      setLinking(null)
    }
  }

  // Group results by type
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    acc[r.type] = acc[r.type] ?? []
    acc[r.type].push(r)
    return acc
  }, {})

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Link to...</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            placeholder="Search notes, projects, bookmarks..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />

          {loading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          )}

          {!loading && query.trim() && results.length === 0 && (
            <p className="text-sm text-center text-muted-foreground py-4">
              No results found
            </p>
          )}

          {!loading && Object.entries(grouped).map(([type, items]) => (
            <div key={type} className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground px-1">
                {TYPE_LABEL[type] ?? type}
              </p>
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  disabled={linking === item.id}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-muted transition-colors text-left disabled:opacity-50"
                >
                  <span className="text-muted-foreground">{TYPE_ICON[type]}</span>
                  <span className="flex-1 truncate">{item.title}</span>
                  {linking === item.id && (
                    <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                  )}
                </button>
              ))}
            </div>
          ))}

          {!query.trim() && (
            <p className="text-sm text-center text-muted-foreground py-4">
              Type to search across your notes, projects, and bookmarks
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
