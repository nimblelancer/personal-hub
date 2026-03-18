'use client'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Input } from '@/components/ui/input'

const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All types' },
  { value: 'software', label: 'Software' },
  { value: 'learning', label: 'Learning' },
  { value: 'content', label: 'Content' },
  { value: 'personal', label: 'Personal' },
]

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'idea', label: 'Idea' },
  { value: 'planning', label: 'Planning' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
]

export function ProjectFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set(key, value)
      else params.delete(key)
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  const search = searchParams.get('search') ?? ''
  const type = searchParams.get('type') ?? ''
  const status = searchParams.get('status') ?? ''
  const visibility = searchParams.get('visibility') ?? ''

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Input
        type="search"
        placeholder="Search projects..."
        defaultValue={search}
        onChange={(e) => updateParam('search', e.target.value)}
        className="h-8 w-48"
      />

      <select
        value={type}
        onChange={(e) => updateParam('type', e.target.value)}
        className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        {TYPE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      <select
        value={status}
        onChange={(e) => updateParam('status', e.target.value)}
        className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      <div className="flex items-center gap-1 rounded-lg border border-input overflow-hidden h-8">
        {(['', 'private', 'public'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => updateParam('visibility', v)}
            className={`px-2.5 h-full text-sm transition-colors ${
              visibility === v
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            }`}
          >
            {v === '' ? 'All' : v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>
    </div>
  )
}
