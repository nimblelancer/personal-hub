import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getRoadmap } from '@/lib/actions/roadmap-actions'
import { RoadmapNodeTree } from '@/components/admin/roadmap/roadmap-node-tree'
import { RoadmapDetailActions } from '@/components/admin/roadmap/roadmap-detail-actions'
import { Badge } from '@/components/ui/badge'

type Props = {
  params: Promise<{ id: string }>
}

export default async function RoadmapDetailPage({ params }: Props) {
  const { id } = await params
  const result = await getRoadmap(id)

  if (!result) notFound()

  const { roadmap, nodes } = result

  const completedStatuses = ['learned', 'mastered']
  const completed = nodes.filter((n) => completedStatuses.includes(n.status)).length
  const total = nodes.length
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back link */}
      <Link
        href="/admin/learning/roadmap"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-3.5" /> All Roadmaps
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-semibold truncate">{roadmap.name}</h1>
            <Badge variant="secondary">{roadmap.topic}</Badge>
          </div>
          {roadmap.description && (
            <p className="text-sm text-muted-foreground">{roadmap.description}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {completed} / {total} nodes completed ({percentage}%)
          </p>
        </div>

        <RoadmapDetailActions roadmap={roadmap} />
      </div>

      {/* Node tree */}
      <RoadmapNodeTree initialNodes={nodes} roadmapId={roadmap.id} />
    </div>
  )
}
