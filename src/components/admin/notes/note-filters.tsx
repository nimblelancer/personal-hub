'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

const TOPICS: Array<{ value: string; label: string }> = [
  { value: '', label: 'All topics' },
  { value: 'ai-ml', label: 'AI / ML' },
  { value: 'coding', label: 'Coding' },
  { value: 'english', label: 'English' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'other', label: 'Other' },
]

const VISIBILITIES = [
  { value: '', label: 'All' },
  { value: 'private', label: 'Private' },
  { value: 'public', label: 'Public' },
]

export function NoteFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [topic, setTopic] = useState(searchParams.get('topic') ?? '')
  const [visibility, setVisibility] = useState(searchParams.get('visibility') ?? '')

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([k, v]) => {
        if (v) params.set(k, v)
        else params.delete(k)
      })
      params.delete('page')
      router.push(`?${params.toString()}`)
    },
    [router, searchParams]
  )

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      updateParams({ search })
    }, 300)
    return () => clearTimeout(timer)
  }, [search]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleTopic(value: string) {
    setTopic(value)
    updateParams({ topic: value })
  }

  function handleVisibility(value: string) {
    setVisibility(value)
    updateParams({ visibility: value })
  }

  return (
    <div className="flex gap-2 flex-wrap items-center">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes..."
          className="pl-8"
        />
      </div>

      <select
        value={topic}
        onChange={(e) => handleTopic(e.target.value)}
        className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        {TOPICS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>

      <select
        value={visibility}
        onChange={(e) => handleVisibility(e.target.value)}
        className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        {VISIBILITIES.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
      </select>
    </div>
  )
}
