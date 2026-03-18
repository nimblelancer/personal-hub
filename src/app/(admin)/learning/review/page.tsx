import { getReviewQueue } from '@/lib/actions/review-actions'
import { ReviewQueue } from '@/components/admin/review/review-queue'

export default async function ReviewPage() {
  const queue = await getReviewQueue()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Review</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Spaced repetition review session</p>
      </div>
      <ReviewQueue initialQueue={queue} />
    </div>
  )
}
