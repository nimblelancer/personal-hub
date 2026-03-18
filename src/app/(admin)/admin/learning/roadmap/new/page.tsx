import { RoadmapForm } from '@/components/admin/roadmap/roadmap-form'

export default function NewRoadmapPage() {
  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-semibold">Create Roadmap</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Define a new learning roadmap with topics and goals
        </p>
      </div>
      <RoadmapForm />
    </div>
  )
}
