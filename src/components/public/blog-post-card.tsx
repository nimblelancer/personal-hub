import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import type { Note } from '@/types/index'

// Strip markdown syntax for a plain text preview
function stripMarkdown(text: string): string {
  return text
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\(.*?\)/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/[*_~`]/g, '')
    .replace(/\n+/g, ' ')
    .trim()
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const TOPIC_LABELS: Record<string, string> = {
  'ai-ml': 'AI/ML',
  coding: 'Coding',
  english: 'English',
  japanese: 'Japanese',
  other: 'Other',
}

export function BlogPostCard({ note }: { note: Note }) {
  const preview = stripMarkdown(note.content).slice(0, 200)

  return (
    <Link
      href={`/blog/${note.id}`}
      className="group flex flex-col gap-2 p-5 rounded-xl border border-border bg-card hover:border-foreground/20 hover:shadow-sm transition-all"
    >
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="secondary" className="text-xs">
          {TOPIC_LABELS[note.topic] ?? note.topic}
        </Badge>
        <span className="text-xs text-muted-foreground">{formatDate(note.created_at)}</span>
      </div>

      <h3 className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors">
        {note.title}
      </h3>

      {preview && (
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
          {preview}
          {preview.length >= 200 ? '…' : ''}
        </p>
      )}

      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {note.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}
