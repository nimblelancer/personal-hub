'use client'
import { useEffect, useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NoteFilters } from './note-filters'
import { NoteCard } from './note-card'
import { getNotes } from '@/lib/actions/note-actions'
import type { NoteWithReview, NoteFilters as Filters } from '@/types/index'

type Props = {
  initialNotes: NoteWithReview[]
  initialTotal: number
}

export function NoteList({ initialNotes, initialTotal }: Props) {
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [notes, setNotes] = useState<NoteWithReview[]>(initialNotes)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(1)

  const PAGE_SIZE = 20

  useEffect(() => {
    startTransition(async () => {
      const filters: Filters = {
        search: searchParams.get('search') ?? undefined,
        topic: (searchParams.get('topic') as Filters['topic']) ?? undefined,
        visibility: (searchParams.get('visibility') as Filters['visibility']) ?? undefined,
        page: 1,
        pageSize: PAGE_SIZE,
      }
      const result = await getNotes(filters)
      setNotes(result.notes)
      setTotal(result.total)
      setPage(1)
    })
  }, [searchParams])

  function loadMore() {
    const nextPage = page + 1
    startTransition(async () => {
      const filters: Filters = {
        search: searchParams.get('search') ?? undefined,
        topic: (searchParams.get('topic') as Filters['topic']) ?? undefined,
        visibility: (searchParams.get('visibility') as Filters['visibility']) ?? undefined,
        page: nextPage,
        pageSize: PAGE_SIZE,
      }
      const result = await getNotes(filters)
      setNotes((prev) => [...prev, ...result.notes])
      setPage(nextPage)
    })
  }

  const hasMore = notes.length < total

  return (
    <div className="space-y-4">
      <NoteFilters />

      {isPending && notes.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="size-10 text-muted-foreground mb-3" />
          <p className="font-medium">No notes yet</p>
          <p className="text-sm text-muted-foreground mt-1">Create your first one!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={loadMore} disabled={isPending}>
                {isPending ? 'Loading...' : 'Load more'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
