import Link from 'next/link'
import { Github, Linkedin, Globe, Twitter } from 'lucide-react'
import type { Json } from '@/types/database'

type ContactJson = {
  github?: string
  linkedin?: string
  twitter?: string
  website?: string
  email?: string
}

function parseContact(contact: Json): ContactJson {
  if (typeof contact === 'object' && contact !== null && !Array.isArray(contact)) {
    return contact as ContactJson
  }
  return {}
}

export function PublicFooter({ contactJson }: { contactJson?: Json }) {
  const contact = parseContact(contactJson ?? {})
  const year = new Date().getFullYear()

  const socialLinks = [
    contact.github && { href: contact.github, icon: Github, label: 'GitHub' },
    contact.linkedin && { href: contact.linkedin, icon: Linkedin, label: 'LinkedIn' },
    contact.twitter && { href: contact.twitter, icon: Twitter, label: 'Twitter' },
    contact.website && { href: contact.website, icon: Globe, label: 'Website' },
  ].filter(Boolean) as { href: string; icon: React.ElementType; label: string }[]

  return (
    <footer className="border-t border-border mt-auto">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          &copy; {year} All rights reserved.
        </p>
        {socialLinks.length > 0 && (
          <div className="flex items-center gap-3">
            {socialLinks.map(({ href, icon: Icon, label }) => (
              <Link
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon className="h-4 w-4" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </footer>
  )
}
