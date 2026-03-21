'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { AdminSidebarNav } from './admin-sidebar-nav'

function SidebarLogo() {
  return (
    <Link href="/admin/dashboard" className="flex items-center gap-2.5 px-4 py-4 border-b border-border">
      <div
        className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0"
        style={{ background: 'linear-gradient(135deg, oklch(0.60 0.18 165), oklch(0.65 0.16 200))' }}
      >
        <Layers className="h-4 w-4 text-white" />
      </div>
      <span className="font-semibold text-sm tracking-tight">Personal Hub</span>
    </Link>
  )
}

export function AdminSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile: hamburger trigger */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-3 z-50 md:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile: Sheet drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-60 p-0 flex flex-col">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <SidebarLogo />
          <AdminSidebarNav onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Desktop: fixed sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-60 flex-col border-r border-border bg-sidebar">
        <SidebarLogo />
        <AdminSidebarNav />
      </aside>
    </>
  )
}
