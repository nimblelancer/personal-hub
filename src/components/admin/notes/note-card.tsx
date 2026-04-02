import Link from 'next/link'
import { Eye, Lock, Calendar } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { NoteWithReview } from '@/types/index'

const TOPIC_COLORS: Record<string, string> = {
  'ai-ml': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  'coding': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'english': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  'japanese': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  'other': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
}

function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/>\s+/g, '')
    .replace(/\n+/g, ' ')
    .trim()
}

type Props = {
  note: NoteWithReview
}

export function NoteCard({ note }: Props) {
  const preview = stripMarkdown(note.content).slice(0, 100)
  const visibleTags = note.tags.slice(0, 3)
  const overflowCount = note.tags.length - 3

  return (
    <Link href={`/admin/learning/notes/${note.id}`} className="block group">
      <Card className="hover:ring-foreground/20 transition-all h-full">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
              {note.title}
            </CardTitle>
            <div className="shrink-0 mt-0.5">
              {note.visibility === 'public' ? (
                <Eye className="size-3.5 text-muted-foreground" />
              ) : (
                <Lock className="size-3.5 text-muted-foreground" />
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap mt-1">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${TOPIC_COLORS[note.topic] ?? TOPIC_COLORS.other}`}>
              {note.topic}
            </span>
          </div>
        </CardHeader>

        {preview && (
          <CardContent>
            <CardDescription className="line-clamp-2 text-xs">{preview}</CardDescription>
          </CardContent>
        )}

        <CardContent className="pt-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex gap-1 flex-wrap">
              {visibleTags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
              ))}
              {overflowCount > 0 && (
                <Badge variant="outline" className="text-xs">+{overflowCount}</Badge>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="size-3" />
              {new Date(note.updated_at).toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
