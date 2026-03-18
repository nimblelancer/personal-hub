import { Suspense } from 'react'
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

function WidgetSkeleton() {
  return <div className="animate-pulse rounded-xl bg-muted h-40" />
}

function WideWidgetSkeleton() {
  return (
    <div className="animate-pulse rounded-xl bg-muted h-40 sm:col-span-2" />
  )
}

async function ReviewDueWidgetLoader({ userId }: { userId: string }) {
  const [count, preview] = await Promise.all([
    getReviewDueCount(userId),
    getReviewDuePreview(userId, 5),
  ])
  return <ReviewDueWidget count={count} preview={preview} />
}

async function ActiveProjectsWidgetLoader({ userId }: { userId: string }) {
  const projects = await getActiveProjects(userId)
  return <ActiveProjectsWidget projects={projects} />
}

async function RecentActivityWidgetLoader({ userId }: { userId: string }) {
  const activities = await getRecentActivity(userId, 20)
  return <RecentActivityWidget activities={activities} />
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

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
        <Suspense fallback={<WidgetSkeleton />}>
          <ReviewDueWidgetLoader userId={user.id} />
        </Suspense>
        <Suspense fallback={<WidgetSkeleton />}>
          <ActiveProjectsWidgetLoader userId={user.id} />
        </Suspense>
        <QuickActionsWidget />
        <Suspense fallback={<WideWidgetSkeleton />}>
          <RecentActivityWidgetLoader userId={user.id} />
        </Suspense>
      </DashboardGrid>
    </div>
  )
}
