'use client'
import { useState } from 'react'
import { CheckCircle } from 'lucide-react'
import { ReviewCard } from './review-card'
import type { NoteWithReview } from '@/types/index'

type Props = { initialQueue: NoteWithReview[] }

export function ReviewQueue({ initialQueue }: Props) {
  const [queue] = useState<NoteWithReview[]>(initialQueue)
  const [currentIndex, setCurrentIndex] = useState(0)

  const total = queue.length
  const current = queue[currentIndex]

  function handleComplete() {
    setCurrentIndex((prev) => prev + 1)
  }

  if (total === 0 || currentIndex >= total) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <CheckCircle className="size-12 text-green-500 mb-4" />
        <h2 className="text-xl font-semibold">All caught up!</h2>
        <p className="text-muted-foreground mt-2">No reviews due today.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground font-medium">
          {total} note{total !== 1 ? 's' : ''} due for review
        </p>
        <p className="text-sm font-medium">
          {currentIndex + 1} / {total}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${(currentIndex / total) * 100}%` }}
        />
      </div>

      {current && <ReviewCard note={current} onComplete={handleComplete} />}
    </div>
  )
}
