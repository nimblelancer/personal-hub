import { createClient } from '@/lib/supabase/server'
import {
  getReviewDueCount,
  getReviewDuePreview,
  getActiveProjects,
  getRecentActivity,
} from '@/lib/actions/dashboard-actions'
import { DashboardGrid } from '@/components/admin/dashboard/dashboard-grid'
import { ReviewDueWidget } from '@/components/admin/dashboard/review-due-widget'
import { ActiveProjectsWidget } from '@/components/admin/dashboard/active-projects-widget'
import { RecentActivityWidget } from '@/components/admin/dashboard/recent-activity-widget'
import { QuickActionsWidget } from '@/components/admin/dashboard/quick-actions-widget'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const [reviewCount, reviewPreview, activeProjects, recentActivity] =
    await Promise.all([
      getReviewDueCount(user.id),
      getReviewDuePreview(user.id, 5),
      getActiveProjects(user.id),
      getRecentActivity(user.id, 20),
    ])

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {getGreeting()}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">{formatDate()}</p>
      </div>

      {/* Widgets grid */}
      <DashboardGrid>
        <ReviewDueWidget count={reviewCount} preview={reviewPreview} />
        <ActiveProjectsWidget projects={activeProjects} />
        <QuickActionsWidget />
        <RecentActivityWidget activities={recentActivity} />
      </DashboardGrid>
    </div>
  )
}
