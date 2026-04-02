'use client'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { BookOpen, FolderOpen, Bookmark, X } from 'lucide-react'
import { deleteEntityLink } from '@/lib/actions/entity-link-actions'
import type { LinkedEntity } from '@/lib/actions/entity-link-actions'

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

function entityHref(type: string, id: string): string {
  if (type === 'note') return `/admin/learning/notes/${id}`
  if (type === 'project') return `/projects/${id}`
  if (type === 'bookmark') return `/learning/bookmarks`
  return '#'
}

interface LinkedEntitiesListProps {
  links: LinkedEntity[]
}

export function LinkedEntitiesList({ links }: LinkedEntitiesListProps) {
  if (links.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">No linked items yet.</p>
    )
  }

  // Group by type
  const grouped = links.reduce<Record<string, LinkedEntity[]>>((acc, link) => {
    acc[link.type] = acc[link.type] ?? []
    acc[link.type].push(link)
    return acc
  }, {})

  async function handleDelete(linkId: string) {
    await deleteEntityLink(linkId)
  }

  return (
    <div className="space-y-3">
      {Object.entries(grouped).map(([type, items]) => (
        <div key={type} className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {TYPE_LABEL[type] ?? type}
          </p>
          {items.map((item) => (
            <div
              key={item.linkId}
              className="flex items-center gap-1.5 group"
            >
              <Link
                href={entityHref(type, item.id)}
                className="flex items-center gap-1.5 flex-1 min-w-0 px-2 py-1 rounded-md text-sm hover:bg-muted transition-colors text-foreground/80 hover:text-foreground"
              >
                <span className="text-muted-foreground">{TYPE_ICON[type]}</span>
                <span className="truncate">{item.title}</span>
              </Link>
              <form action={handleDelete.bind(null, item.linkId)}>
                <button
                  type="submit"
                  className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                  aria-label="Remove link"
                >
                  <X className="size-3" />
                </button>
              </form>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
