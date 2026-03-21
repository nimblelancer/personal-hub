import { AdminSidebar } from '@/components/admin/admin-sidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen flex bg-background overflow-x-hidden">
      {/* Subtle background orbs — lighter than public site */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-10 dark:opacity-5"
          style={{
            background: 'radial-gradient(circle, oklch(0.60 0.18 165) 0%, transparent 70%)',
            animation: 'orb-drift-1 20s ease-in-out infinite',
          }}
        />
        <div
          className="absolute -bottom-40 -left-20 w-[400px] h-[400px] rounded-full opacity-10 dark:opacity-5"
          style={{
            background: 'radial-gradient(circle, oklch(0.65 0.16 200) 0%, transparent 70%)',
            animation: 'orb-drift-2 25s ease-in-out infinite',
          }}
        />
      </div>
      <AdminSidebar />
      <main className="relative z-10 flex-1 overflow-auto p-6 ml-0 md:ml-60">
        {children}
      </main>
    </div>
  )
}
