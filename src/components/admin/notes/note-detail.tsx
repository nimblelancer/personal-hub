import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import { Eye, Lock, Pencil, Calendar, Tag, BookOpen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DeleteNoteButton } from './delete-note-button'
import type { NoteWithReview } from '@/types/index'

const TOPIC_COLORS: Record<string, string> = {
  'ai-ml': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  'coding': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'english': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  'japanese': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  'other': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
}

type Props = { note: NoteWithReview }

export function NoteDetail({ note }: Props) {
  const rs = note.review_schedule

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main content */}
      <article className="flex-1 min-w-0">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
            {note.content}
          </ReactMarkdown>
        </div>
      </article>

      {/* Sidebar */}
      <aside className="w-full lg:w-64 shrink-0 space-y-4">
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-sm">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <BookOpen className="size-3.5 text-muted-foreground shrink-0" />
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TOPIC_COLORS[note.topic] ?? TOPIC_COLORS.other}`}>
                {note.topic}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {note.visibility === 'public' ? (
                <Eye className="size-3.5 text-muted-foreground shrink-0" />
              ) : (
                <Lock className="size-3.5 text-muted-foreground shrink-0" />
              )}
              <span className="capitalize text-muted-foreground">{note.visibility}</span>
            </div>

            {note.tags.length > 0 && (
              <div className="flex items-start gap-2">
                <Tag className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex flex-wrap gap-1">
                  {note.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="size-3.5 shrink-0" />
              <span>Updated {new Date(note.updated_at).toLocaleDateString()}</span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="size-3.5 shrink-0" />
              <span>Created {new Date(note.created_at).toLocaleDateString()}</span>
            </div>

            {rs && (
              <div className="pt-2 border-t">
                <p className="text-xs font-medium text-muted-foreground mb-1">Review</p>
                <p className="text-xs">Level {rs.level} / 5</p>
                <p className="text-xs text-muted-foreground">
                  Next: {new Date(rs.next_review).toLocaleDateString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Link
            href={`/learning/notes/${note.id}/edit`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
          >
            <Pencil className="size-3.5" /> Edit
          </Link>
          <DeleteNoteButton noteId={note.id} />
        </div>
      </aside>
    </div>
  )
}
