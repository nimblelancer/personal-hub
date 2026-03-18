import { PublicNavbar } from '@/components/public/public-navbar'
import { PublicFooter } from '@/components/public/public-footer'
import { getPublicProfile } from '@/lib/actions/profile-actions'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getPublicProfile()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicNavbar displayName={profile?.display_name} />
      <main className="flex-1">
        {children}
      </main>
      <PublicFooter contactJson={profile?.contact_json} />
    </div>
  )
}
