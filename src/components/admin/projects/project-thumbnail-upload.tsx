'use client'
import Image from 'next/image'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface ProjectThumbnailUploadProps {
  currentUrl?: string | null
  onChange: (file: File | null) => void
}

export function ProjectThumbnailUpload({ currentUrl, onChange }: ProjectThumbnailUploadProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="thumbnail">Thumbnail image</Label>
      {currentUrl && (
        <Image
          src={currentUrl}
          alt="thumbnail"
          width={128}
          height={80}
          className="h-20 w-32 object-cover rounded-lg"
        />
      )}
      <Input
        id="thumbnail"
        name="thumbnail"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="cursor-pointer"
      />
    </div>
  )
}
