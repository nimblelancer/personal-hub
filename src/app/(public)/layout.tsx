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
    <div className="relative min-h-screen flex flex-col bg-background overflow-x-hidden">
      {/* Animated background orbs — CSS only, pointer-events-none */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Orb 1: emerald, top-right */}
        <div
          className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-20 dark:opacity-10"
          style={{
            background: 'radial-gradient(circle, oklch(0.60 0.18 165) 0%, transparent 70%)',
            animation: 'orb-drift-1 20s ease-in-out infinite',
          }}
        />
        {/* Orb 2: cyan, bottom-left */}
        <div
          className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full opacity-20 dark:opacity-10"
          style={{
            background: 'radial-gradient(circle, oklch(0.65 0.16 200) 0%, transparent 70%)',
            animation: 'orb-drift-2 25s ease-in-out infinite',
          }}
        />
      </div>

      <PublicNavbar displayName={profile?.display_name} />
      <main className="relative z-10 flex-1">
        {children}
      </main>
      <PublicFooter contactJson={profile?.contact_json} />
    </div>
  )
}
