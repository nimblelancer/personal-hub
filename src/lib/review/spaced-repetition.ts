// Spaced repetition intervals in days
export const INTERVALS = [1, 3, 7, 14, 30, 90] as const

export type ReviewRating = 'remember' | 'fuzzy' | 'forgot'

export function calculateNextReview(
  currentLevel: number,
  rating: ReviewRating
): { newLevel: number; nextReviewDays: number } {
  if (rating === 'remember') {
    const newLevel = Math.min(currentLevel + 1, 5)
    return { newLevel, nextReviewDays: INTERVALS[newLevel] }
  }
  if (rating === 'fuzzy') {
    const newLevel = currentLevel
    return { newLevel, nextReviewDays: Math.max(1, Math.floor(INTERVALS[currentLevel] / 2)) }
  }
  // forgot
  return { newLevel: 0, nextReviewDays: 1 }
}

// Returns date string YYYY-MM-DD
export function addDays(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}
