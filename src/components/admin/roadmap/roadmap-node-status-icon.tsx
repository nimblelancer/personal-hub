import { Circle, CircleDot, CheckCircle, Star } from 'lucide-react'
import type { RoadmapNodeStatusType } from '@/types/database'

export function RoadmapNodeStatusIcon({ status }: { status: RoadmapNodeStatusType }) {
  switch (status) {
    case 'not_started':
      return <Circle className="size-4 text-muted-foreground" />
    case 'in_progress':
      return <CircleDot className="size-4 text-blue-500" />
    case 'learned':
      return <CheckCircle className="size-4 text-green-500" />
    case 'mastered':
      return <Star className="size-4 text-yellow-500 fill-yellow-500" />
  }
}
