import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

/**
 * Protected route patterns.
 * Any path matching these will require an authenticated Clerk session.
 * Unauthenticated visitors are redirected to /sign-in automatically.
 */
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/interview(.*)',
  '/profile(.*)',
  '/settings(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  // Protect matched routes — Clerk will redirect to sign-in if not authed
  if (isProtectedRoute(req)) {
    await auth.protect()
  }

  return NextResponse.next()
})

export const config = {
  /**
   * Run middleware on all routes EXCEPT:
   * - Next.js internals (_next/static, _next/image)
   * - Static files (favicon, OG images, etc.)
   * - Public API routes that must remain open
   *
   * The negative lookahead keeps the matcher list lean and fast.
   */
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
