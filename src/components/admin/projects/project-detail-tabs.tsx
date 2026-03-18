'use client'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ProjectOverview } from './project-overview'
import { ProjectDocsEditor } from './project-docs-editor'
import { MilestoneList } from './milestone-list'
import { LessonsLearnedEditor } from './lessons-learned-editor'
import type { ProjectWithDetails } from '@/types'

interface ProjectDetailTabsProps {
  project: ProjectWithDetails
}

export function ProjectDetailTabs({ project }: ProjectDetailTabsProps) {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="docs">Docs</TabsTrigger>
        <TabsTrigger value="milestones">
          Milestones
          {project.project_milestones.length > 0 && (
            <span className="ml-1 text-xs text-muted-foreground">
              ({project.project_milestones.length})
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="lessons">Lessons Learned</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-4">
        <ProjectOverview project={project} />
      </TabsContent>

      <TabsContent value="docs" className="mt-4">
        <ProjectDocsEditor
          projectId={project.id}
          initialContent={project.project_docs?.content ?? ''}
        />
      </TabsContent>

      <TabsContent value="milestones" className="mt-4">
        <MilestoneList
          projectId={project.id}
          milestones={project.project_milestones}
        />
      </TabsContent>

      <TabsContent value="lessons" className="mt-4">
        <LessonsLearnedEditor
          projectId={project.id}
          initialContent={project.lessons_learned?.content ?? null}
        />
      </TabsContent>
    </Tabs>
  )
}
