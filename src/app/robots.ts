import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/projects', '/blog', '/resume'],
      disallow: ['/dashboard', '/login', '/learning', '/settings'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
