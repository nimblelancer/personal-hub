'use client'
import { useState, useTransition } from 'react'
import { MarkdownEditor } from '@/components/shared/markdown-editor'
import { Button } from '@/components/ui/button'
import { updateProjectDoc } from '@/lib/actions/project-actions'

interface ProjectDocsEditorProps {
  projectId: string
  initialContent: string
}

export function ProjectDocsEditor({ projectId, initialContent }: ProjectDocsEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const result = await updateProjectDoc(projectId, content)
      if ('error' in result) setError(result.error ?? null)
      else { setSaved(true); setTimeout(() => setSaved(false), 2500) }
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Project documentation — supports full Markdown
        </p>
        <div className="flex items-center gap-2">
          {saved && <span className="text-xs text-green-600 dark:text-green-400">Saved</span>}
          {error && <span className="text-xs text-destructive">{error}</span>}
          <Button size="sm" onClick={handleSave} disabled={isPending}>
            {isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
      <MarkdownEditor value={content} onChange={setContent} placeholder="Write your project documentation here..." />
    </div>
  )
}
