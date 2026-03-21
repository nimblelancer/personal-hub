'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, Layers, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { AdminSidebarNav } from './admin-sidebar-nav'
import { useSearch } from './admin-search-provider'

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

function SearchTrigger() {
  const { openSearch } = useSearch()
  // Detect platform post-hydration to avoid SSR mismatch
  const [isMac, setIsMac] = useState(true)
  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform))
  }, [])

  return (
    <button
      onClick={openSearch}
      className="mx-3 my-2 flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      aria-label="Open search"
    >
      <Search className="h-3.5 w-3.5 shrink-0" />
      <span className="hidden md:inline flex-1 text-left">Search...</span>
      <kbd className="hidden md:inline-flex items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 text-xs font-mono text-muted-foreground">
        {isMac ? '⌘K' : 'Ctrl+K'}
      </kbd>
    </button>
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
          <SearchTrigger />
          <AdminSidebarNav onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Desktop: fixed sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-60 flex-col border-r border-border bg-sidebar">
        <SidebarLogo />
        <SearchTrigger />
        <AdminSidebarNav />
      </aside>
    </>
  )
}
