import { SignUp } from '@clerk/nextjs'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create your free UpNext account. Practice AI interviews, discover top engineering roles, and get hired faster.',
  robots: { index: false, follow: false },
}

/**
 * Sign-up page — Uses the Clerk `<SignUp>` component.
 *
 * The catch-all segment `[[...sign-up]]` handles email verification,
 * OAuth callbacks, and the progressive sign-up flow in a single route.
 *
 * Appearance is controlled globally via `clerkAppearance` in root layout.tsx.
 */
export default function SignUpPage() {
  return (
    <SignUp
      path="/sign-up"
      routing="path"
      signInUrl="/sign-in"
      forceRedirectUrl="/dashboard"
    />
  )
}
