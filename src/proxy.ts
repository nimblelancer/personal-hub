import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { checkRateLimit } from '@/lib/rate-limiter'

export async function proxy(request: NextRequest) {
  // Rate-limit requests to the login page (5 req/min per IP)
  if (request.nextUrl.pathname === '/login') {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1'
    if (!checkRateLimit(ip, 5, 60_000)) {
      return new NextResponse('Too many requests', { status: 429 })
    }
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
