import type { Metadata } from 'next'
import { getPublicProfile } from '@/lib/actions/profile-actions'
import { ResumeContent } from '@/components/public/resume-content'

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getPublicProfile()
  const name = profile?.display_name ?? 'Developer'
  return {
    title: `Resume — ${name}`,
    description: `Professional resume for ${name}.`,
    openGraph: {
      title: `Resume — ${name}`,
      description: `Professional resume for ${name}.`,
      type: 'profile',
    },
  }
}

export default async function ResumePage() {
  const profile = await getPublicProfile()
  const content = profile?.resume_content

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Resume</h1>
        {profile?.display_name && (
          <p className="text-muted-foreground text-sm">{profile.display_name}</p>
        )}
      </header>

      {content ? (
        <ResumeContent content={content} />
      ) : (
        <div className="py-16 text-center">
          <p className="text-muted-foreground text-sm">Resume coming soon.</p>
        </div>
      )}
    </div>
  )
}
