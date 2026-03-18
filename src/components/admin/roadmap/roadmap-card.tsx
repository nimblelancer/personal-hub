'use client'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import type { RoadmapWithStats } from '@/types/index'

type Props = {
  roadmap: RoadmapWithStats
}

export function RoadmapCard({ roadmap }: Props) {
  return (
    <Link
      href={`/learning/roadmap/${roadmap.id}`}
      className="block p-4 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-1">
          {roadmap.name}
        </h3>
        <Badge variant="secondary" className="text-xs shrink-0">
          {roadmap.topic}
        </Badge>
      </div>

      {roadmap.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {roadmap.description}
        </p>
      )}

      {/* Progress bar */}
      <div className="mt-auto">
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-1.5">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${roadmap.percentage}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {roadmap.completed_count} / {roadmap.node_count} nodes completed ({roadmap.percentage}%)
        </p>
      </div>
    </Link>
  )
}
