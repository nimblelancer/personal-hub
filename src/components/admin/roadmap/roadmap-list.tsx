import Link from 'next/link'
import { Plus, Map } from 'lucide-react'
import { RoadmapCard } from './roadmap-card'
import type { RoadmapWithStats } from '@/types/index'

type Props = {
  roadmaps: RoadmapWithStats[]
}

export function RoadmapList({ roadmaps }: Props) {
  if (roadmaps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Map className="size-10 text-muted-foreground mb-3" />
        <h3 className="font-medium mb-1">No roadmaps yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Create your first learning roadmap to track your progress
        </p>
        <Link
          href="/learning/roadmap/new"
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="size-3.5" /> New Roadmap
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {roadmaps.map((roadmap) => (
        <RoadmapCard key={roadmap.id} roadmap={roadmap} />
      ))}
    </div>
  )
}
