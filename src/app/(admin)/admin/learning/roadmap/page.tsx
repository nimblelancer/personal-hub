import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getRoadmaps } from '@/lib/actions/roadmap-actions'
import { RoadmapList } from '@/components/admin/roadmap/roadmap-list'

export default async function RoadmapPage() {
  const roadmaps = await getRoadmaps()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Roadmaps</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {roadmaps.length} {roadmaps.length === 1 ? 'roadmap' : 'roadmaps'}
          </p>
        </div>
        <Link
          href="/admin/learning/roadmap/new"
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="size-3.5" /> New Roadmap
        </Link>
      </div>

      <RoadmapList roadmaps={roadmaps} />
    </div>
  )
}
