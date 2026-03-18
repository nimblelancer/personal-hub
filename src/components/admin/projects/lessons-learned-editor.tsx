'use client'
import { useState, useTransition } from 'react'
import { MarkdownEditor } from '@/components/shared/markdown-editor'
import { Button } from '@/components/ui/button'
import { updateLessonsLearned } from '@/lib/actions/project-actions'

const DEFAULT_TEMPLATE = `## Technical
What did I learn technically?

## Process
What did I learn about project management?

## Reusable
What can I reuse in future projects?`

interface LessonsLearnedEditorProps {
  projectId: string
  initialContent: string | null
}

export function LessonsLearnedEditor({ projectId, initialContent }: LessonsLearnedEditorProps) {
  const [content, setContent] = useState(initialContent ?? DEFAULT_TEMPLATE)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const result = await updateLessonsLearned(projectId, content)
      if ('error' in result) setError(result.error ?? null)
      else { setSaved(true); setTimeout(() => setSaved(false), 2500) }
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Capture what you learned — technical insights, process improvements, reusable patterns
        </p>
        <div className="flex items-center gap-2">
          {saved && <span className="text-xs text-green-600 dark:text-green-400">Saved</span>}
          {error && <span className="text-xs text-destructive">{error}</span>}
          <Button size="sm" onClick={handleSave} disabled={isPending}>
            {isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
      <MarkdownEditor value={content} onChange={setContent} placeholder="What did you learn?" />
    </div>
  )
}
