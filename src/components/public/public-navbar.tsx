'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu } from 'lucide-react'
import { motion } from 'framer-motion'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/projects', label: 'Projects' },
  { href: '/blog', label: 'Blog' },
  { href: '/resume', label: 'Resume' },
]

export function PublicNavbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 flex h-14 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-semibold text-sm tracking-tight hover:text-foreground/80 transition-colors">
          Portfolio
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1">
          {navLinks.map(({ href, label }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'relative px-3 py-1.5 text-sm rounded-md transition-colors',
                  active ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-md"
                    style={{ background: 'oklch(0.60 0.18 165 / 0.12)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{label}</span>
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                    style={{ background: 'oklch(0.60 0.18 165)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Mobile hamburger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className="sm:hidden p-1.5 rounded-md hover:bg-muted transition-colors cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-64 pt-10">
            <nav className="flex flex-col gap-1">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'px-3 py-2 rounded-md text-sm transition-colors',
                    isActive(href)
                      ? 'font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                  style={isActive(href) ? {
                    background: 'oklch(0.60 0.18 165 / 0.12)',
                    color: 'oklch(0.60 0.18 165)',
                  } : {}}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
