'use client'
import { useTransition } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import { toast } from 'sonner'
import { submitReview } from '@/lib/actions/review-actions'
import type { NoteWithReview, ReviewRating } from '@/types/index'

type Props = {
  note: NoteWithReview
  onComplete: () => void
}

const RATING_BUTTONS: Array<{ rating: ReviewRating; label: string; className: string }> = [
  {
    rating: 'remember',
    label: 'Remember',
    className: 'bg-green-600 hover:bg-green-700 text-white border-transparent',
  },
  {
    rating: 'fuzzy',
    label: 'Fuzzy',
    className: 'bg-amber-500 hover:bg-amber-600 text-white border-transparent',
  },
  {
    rating: 'forgot',
    label: 'Forgot',
    className: 'bg-red-600 hover:bg-red-700 text-white border-transparent',
  },
]

export function ReviewCard({ note, onComplete }: Props) {
  const [isPending, startTransition] = useTransition()
  const rs = note.review_schedule

  function handleRating(rating: ReviewRating) {
    if (!rs) return
    startTransition(async () => {
      const result = await submitReview(rs.id, note.id, rating)
      if (result.error) {
        toast.error(result.error)
        return
      }
      onComplete()
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{note.title}</h2>
        {rs && (
          <span className="text-sm text-muted-foreground">
            Level {rs.level} / 5
          </span>
        )}
      </div>

      {rs && (
        <p className="text-xs text-muted-foreground">
          Next review: {new Date(rs.next_review).toLocaleDateString()}
        </p>
      )}

      <div className="prose prose-sm dark:prose-invert max-w-none border border-border rounded-xl p-4 min-h-[200px]">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
          {note.content}
        </ReactMarkdown>
      </div>

      <div className="flex gap-3 justify-center">
        {RATING_BUTTONS.map(({ rating, label, className }) => (
          <button
            key={rating}
            onClick={() => handleRating(rating)}
            disabled={isPending}
            className={`flex-1 h-10 rounded-lg border text-sm font-medium transition-colors disabled:opacity-50 ${className}`}
          >
            {isPending ? '...' : label}
          </button>
        ))}
      </div>
    </div>
  )
}
