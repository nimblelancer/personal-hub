import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/admin/settings/profile-form'
import type { Profile } from '@/types/index'

export const metadata: Metadata = {
  title: 'Settings — Profile',
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return (
      <div className="flex flex-col gap-6 p-6 max-w-3xl">
        <header className="space-y-1">
          <h1 className="text-xl font-semibold">Profile Settings</h1>
        </header>
        <p className="text-sm text-destructive">
          Profile not found. Your account may not be fully set up yet.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-3xl">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">Profile Settings</h1>
        <p className="text-sm text-muted-foreground">
          Edit your public profile, bio, social links, and resume content.
        </p>
      </header>
      <ProfileForm profile={profile as Profile} />
    </div>
  )
}
