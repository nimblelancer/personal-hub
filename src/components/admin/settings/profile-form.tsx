'use client'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { updateProfile } from '@/lib/actions/profile-actions'
import { MarkdownEditor } from '@/components/shared/markdown-editor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Profile } from '@/types/index'

// Convert Google Drive share links to direct image URLs
// Input:  https://drive.google.com/file/d/FILE_ID/view?usp=sharing
// Output: https://lh3.googleusercontent.com/d/FILE_ID
function normalizeAvatarUrl(url: string): string {
  const match = url.match(/drive\.google\.com\/file\/d\/([^/]+)/)
  if (match) return `https://lh3.googleusercontent.com/d/${match[1]}`
  return url
}

function jsonToString(val: unknown): string {
  if (typeof val === 'string') return val
  if (val === null || val === undefined) return ''
  return JSON.stringify(val, null, 2)
}

export function ProfileForm({ profile }: { profile: Profile }) {
  const [isPending, startTransition] = useTransition()
  const [displayName, setDisplayName] = useState(profile.display_name ?? '')
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? '')
  const [bio, setBio] = useState(profile.bio ?? '')
  const [contactJson, setContactJson] = useState(jsonToString(profile.contact_json))
  const [resumeContent, setResumeContent] = useState(profile.resume_content ?? '')
  const [contactError, setContactError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setContactError('')

    let parsedContact: unknown
    try {
      parsedContact = contactJson.trim() ? JSON.parse(contactJson) : {}
    } catch {
      setContactError('Contact JSON is not valid JSON.')
      return
    }

    startTransition(async () => {
      const result = await updateProfile({
        display_name: displayName || null,
        avatar_url: avatarUrl ? normalizeAvatarUrl(avatarUrl) : null,
        bio: bio || null,
        contact_json: parsedContact as import('@/types/database').Json,
        resume_content: resumeContent || null,
      })
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Profile updated')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic info */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Basic Info
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="display-name">Display Name</Label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="avatar-url">Avatar URL</Label>
            <Input
              id="avatar-url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bio">Bio (Markdown)</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Short bio — supports markdown"
            rows={4}
            className="font-mono text-sm resize-none"
          />
        </div>
      </section>

      {/* Contact links */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Contact &amp; Social Links
        </h2>
        <div className="space-y-1.5">
          <Label htmlFor="contact-json">Contact JSON</Label>
          <Textarea
            id="contact-json"
            value={contactJson}
            onChange={(e) => { setContactJson(e.target.value); setContactError('') }}
            placeholder={'{\n  "github": "https://github.com/...",\n  "linkedin": "https://linkedin.com/in/..."\n}'}
            rows={6}
            className="font-mono text-sm resize-none"
          />
          {contactError && (
            <p className="text-xs text-destructive">{contactError}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Keys: github, linkedin, twitter, website, email
          </p>
        </div>
      </section>

      {/* Resume */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Resume Content
        </h2>
        <MarkdownEditor
          value={resumeContent}
          onChange={setResumeContent}
          placeholder="Write your resume in Markdown..."
        />
      </section>

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Saving…' : 'Save Profile'}
      </Button>
    </form>
  )
}
