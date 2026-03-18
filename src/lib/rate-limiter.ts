// In-memory IP-based rate limiter (no external deps).
// Resets per window; suitable for single-instance deployments (personal hub).

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

/**
 * Returns true if the request is allowed, false if rate limit exceeded.
 * @param ip        Client IP address
 * @param max       Max requests per window (default: 10)
 * @param windowMs  Window duration in ms (default: 60s)
 */
export function checkRateLimit(ip: string, max = 10, windowMs = 60_000): boolean {
  const now = Date.now()
  const entry = store.get(ip)

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= max) return false

  entry.count++
  return true
}
