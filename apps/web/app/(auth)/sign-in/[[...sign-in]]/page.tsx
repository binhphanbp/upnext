import { SignIn } from '@clerk/nextjs'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your UpNext account to access AI interviews and job listings.',
  robots: { index: false, follow: false },
}

/**
 * Sign-in page — Uses the Clerk `<SignIn>` component.
 *
 * The catch-all segment `[[...sign-in]]` is required by Clerk to handle
 * multi-step flows (email/password, social OAuth redirect callbacks, etc.)
 * within a single route.
 *
 * Appearance is controlled globally via `clerkAppearance` in root layout.tsx.
 */
export default function SignInPage() {
  return (
    <SignIn
      path="/sign-in"
      routing="path"
      signUpUrl="/sign-up"
      forceRedirectUrl="/dashboard"
    />
  )
}
