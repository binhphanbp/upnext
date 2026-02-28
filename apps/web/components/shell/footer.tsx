import Link from 'next/link'
import { Zap } from 'lucide-react'

const footerLinks = {
  Product: [
    { href: '/jobs', label: 'Browse Jobs' },
    { href: '/interview', label: 'AI Interview' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/changelog', label: 'Changelog' },
  ],
  Company: [
    { href: '/about', label: 'About' },
    { href: '/blog', label: 'Blog' },
    { href: '/careers', label: 'Careers' },
    { href: '/contact', label: 'Contact' },
  ],
  Legal: [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
    { href: '/cookies', label: 'Cookie Policy' },
  ],
} as const

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-zinc-800/60 bg-zinc-950">
      <div className="container-page py-12 md:py-16">
        {/* Top — Brand + links */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2 transition-opacity hover:opacity-80"
              aria-label="UpNext home"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-500">
                <Zap className="h-4 w-4 text-white" aria-hidden="true" />
              </span>
              <span className="text-base font-semibold text-zinc-50">
                Up<span className="text-primary-500">Next</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-500">
              AI-powered interview practice and job portal built for the next
              generation of tech professionals.
            </p>
          </div>

          {/* Links columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
                {category}
              </h3>
              <ul className="flex flex-col gap-3">
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-zinc-400 transition-colors hover:text-zinc-50"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom — Copyright */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-zinc-800/60 pt-8 sm:flex-row">
          <p className="text-xs text-zinc-600">
            &copy; {currentYear} UpNext, Inc. All rights reserved.
          </p>
          <p className="text-xs text-zinc-700">
            Built with Next.js &amp; Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  )
}
