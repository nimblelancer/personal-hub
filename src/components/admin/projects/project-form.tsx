'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { createProject, updateProject } from '@/lib/actions/project-actions'
import { uploadProjectImage } from '@/lib/actions/storage-actions'
import type { Project, ProjectInsert } from '@/types'
import type { ProjectTypeType, ProjectStatusType, VisibilityType } from '@/types/database'
import { XIcon } from 'lucide-react'

interface ProjectFormProps {
  initialData?: Project
  onSuccess?: () => void
}

// Chip input for tech_stack and topics
function ChipInput({
  label,
  chips,
  onChange,
}: {
  label: string
  chips: string[]
  onChange: (chips: string[]) => void
}) {
  const [inputVal, setInputVal] = useState('')

  function add() {
    const val = inputVal.trim()
    if (val && !chips.includes(val)) onChange([...chips, val])
    setInputVal('')
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-1.5 min-h-8 p-1.5 rounded-lg border border-input bg-transparent">
        {chips.map((chip) => (
          <span
            key={chip}
            className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs"
          >
            {chip}
            <button
              type="button"
              onClick={() => onChange(chips.filter((c) => c !== chip))}
              className="text-muted-foreground hover:text-foreground"
            >
              <XIcon className="size-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder="Type + Enter"
          className="flex-1 min-w-20 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
        />
      </div>
    </div>
  )
}

export function ProjectForm({ initialData, onSuccess }: ProjectFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [techStack, setTechStack] = useState<string[]>(initialData?.tech_stack ?? [])
  const [topics, setTopics] = useState<string[]>(initialData?.topics ?? [])
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)

    const payload: Omit<ProjectInsert, 'user_id'> = {
      name: fd.get('name') as string,
      one_liner: (fd.get('one_liner') as string) || null,
      type: fd.get('type') as ProjectTypeType,
      status: fd.get('status') as ProjectStatusType,
      visibility: fd.get('visibility') as VisibilityType,
      github_url: (fd.get('github_url') as string) || null,
      demo_url: (fd.get('demo_url') as string) || null,
      started_at: (fd.get('started_at') as string) || null,
      tech_stack: techStack,
      topics,
    }

    startTransition(async () => {
      let result: { error?: string; data?: Project }

      if (initialData) {
        result = await updateProject(initialData.id, payload)
      } else {
        result = await createProject(payload)
      }

      if (result.error) { setError(result.error ?? null); return }

      const projectId = (result.data as Project).id

      // Upload thumbnail if selected
      if (thumbnailFile && projectId) {
        setUploading(true)
        const imgFd = new FormData()
        imgFd.append('file', thumbnailFile)
        const uploadResult = await uploadProjectImage(projectId, imgFd)
        setUploading(false)
        if ('url' in uploadResult) {
          await updateProject(projectId, { thumbnail_url: uploadResult.url })
        }
      }

      if (onSuccess) onSuccess()
      else router.push(`/admin/projects/${projectId}`)
    })
  }

  const selectClass = 'h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-2xl">
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Project name *</Label>
        <Input id="name" name="name" required defaultValue={initialData?.name} placeholder="My Awesome Project" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="one_liner">One-liner</Label>
        <Input id="one_liner" name="one_liner" defaultValue={initialData?.one_liner ?? ''} placeholder="Short description" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="type">Type</Label>
          <select id="type" name="type" defaultValue={initialData?.type ?? 'software'} className={selectClass}>
            <option value="software">Software</option>
            <option value="learning">Learning</option>
            <option value="content">Content</option>
            <option value="personal">Personal</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="status">Status</Label>
          <select id="status" name="status" defaultValue={initialData?.status ?? 'idea'} className={selectClass}>
            <option value="idea">Idea</option>
            <option value="planning">Planning</option>
            <option value="in_progress">In Progress</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Visibility</Label>
        <div className="flex gap-3">
          {(['private', 'public'] as VisibilityType[]).map((v) => (
            <label key={v} className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value={v}
                defaultChecked={(initialData?.visibility ?? 'private') === v}
              />
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </label>
          ))}
        </div>
      </div>

      <ChipInput label="Tech stack" chips={techStack} onChange={setTechStack} />
      <ChipInput label="Topics" chips={topics} onChange={setTopics} />

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="github_url">GitHub URL</Label>
          <Input id="github_url" name="github_url" type="url" defaultValue={initialData?.github_url ?? ''} placeholder="https://github.com/..." />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="demo_url">Demo URL</Label>
          <Input id="demo_url" name="demo_url" type="url" defaultValue={initialData?.demo_url ?? ''} placeholder="https://..." />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="started_at">Started at</Label>
        <Input
          id="started_at"
          name="started_at"
          type="date"
          defaultValue={initialData?.started_at?.slice(0, 10) ?? ''}
          className="w-40"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="thumbnail">Thumbnail image</Label>
        {initialData?.thumbnail_url && (
          <Image src={initialData.thumbnail_url} alt="thumbnail" width={128} height={80} className="h-20 w-32 object-cover rounded-lg" />
        )}
        <Input
          id="thumbnail"
          name="thumbnail"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(e) => setThumbnailFile(e.target.files?.[0] ?? null)}
          className="cursor-pointer"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isPending || uploading}>
          {isPending || uploading ? 'Saving...' : initialData ? 'Save changes' : 'Create project'}
        </Button>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex h-8 items-center px-3 rounded-lg text-sm border border-border hover:bg-muted transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
