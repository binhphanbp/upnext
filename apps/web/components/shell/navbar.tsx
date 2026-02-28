'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Menu, X, Zap } from 'lucide-react'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

const clerkUserButtonAppearance = {
  elements: {
    avatarBox: 'h-8 w-8 rounded-lg',
    userButtonPopoverCard:
      'bg-zinc-900 border border-zinc-800 shadow-xl shadow-black/40',
    userButtonPopoverActionButton:
      'text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50',
    userButtonPopoverActionButtonText: 'text-zinc-300',
    userButtonPopoverFooter: 'hidden',
  },
}

const navLinks = [
  { href: '/jobs', label: 'Browse Jobs' },
  { href: '/interview', label: 'AI Interview' },
  { href: '/pricing', label: 'Pricing' },
] as const

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md">
      <nav className="container-page flex h-16 items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
          aria-label="UpNext — Back to home"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-500">
            <Zap className="h-4 w-4 text-white" aria-hidden="true" />
          </span>
          <span className="text-base font-semibold tracking-tight text-zinc-50">
            Up<span className="text-primary-500">Next</span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={[
                  'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-zinc-800 text-zinc-50'
                    : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-50',
                ].join(' ')}
              >
                {label}
              </Link>
            )
          })}
        </div>

        {/* Desktop CTA — switches between auth/unauth state */}
        <div className="hidden items-center gap-3 md:flex">
          <SignedOut>
            <Link
              href="/sign-in"
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-50"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-600 active:scale-95"
            >
              Get started
            </Link>
          </SignedOut>

          <SignedIn>
            <Link
              href="/dashboard"
              className={[
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                pathname.startsWith('/dashboard')
                  ? 'bg-zinc-800 text-zinc-50'
                  : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-50',
              ].join(' ')}
            >
              Dashboard
            </Link>
            <UserButton
              afterSignOutUrl="/"
              appearance={clerkUserButtonAppearance}
            />
          </SignedIn>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-50 md:hidden"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-zinc-800/60 bg-zinc-950 md:hidden"
          >
            <div className="container-page flex flex-col gap-1 pb-4 pt-3">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800/60 hover:text-zinc-50"
                >
                  {label}
                </Link>
              ))}
              <div className="mt-3 flex flex-col gap-2 border-t border-zinc-800 pt-3">
                <SignedOut>
                  <Link
                    href="/sign-in"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-4 py-3 text-center text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800/60 hover:text-zinc-50"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg bg-primary-500 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-primary-600"
                  >
                    Get started
                  </Link>
                </SignedOut>
                <SignedIn>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-4 py-3 text-center text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800/60 hover:text-zinc-50"
                  >
                    Dashboard
                  </Link>
                  <div className="flex justify-center py-2">
                    <UserButton
                      afterSignOutUrl="/"
                      appearance={clerkUserButtonAppearance}
                    />
                  </div>
                </SignedIn>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
