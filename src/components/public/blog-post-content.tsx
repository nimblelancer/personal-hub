import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft } from 'lucide-react'
import type { Note } from '@/types/index'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
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

export function BlogPostContent({ note }: { note: Note }) {
  return (
    <article className="space-y-8">
      {/* Back link */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        All Posts
      </Link>

      {/* Header */}
      <header className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-xs">
            {TOPIC_LABELS[note.topic] ?? note.topic}
          </Badge>
          <span className="text-xs text-muted-foreground">{formatDate(note.created_at)}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight leading-tight">
          {note.title}
        </h1>

        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {note.tags.map((tag) => (
              <span key={tag} className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Divider */}
      <hr className="border-border" />

      {/* Content */}
      <div className="prose prose-sm sm:prose dark:prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
          {note.content}
        </ReactMarkdown>
      </div>
    </article>
  )
}
