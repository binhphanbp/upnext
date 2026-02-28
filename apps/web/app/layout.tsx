import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import { Navbar } from '@/components/shell/navbar'
import { Footer } from '@/components/shell/footer'

/* ------------------------------------------------------------------ */
/* Font                                                                 */
/* ------------------------------------------------------------------ */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

/* ------------------------------------------------------------------ */
/* Viewport                                                             */
/* ------------------------------------------------------------------ */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#10B981', // Emerald 500 — primary brand color
}

/* ------------------------------------------------------------------ */
/* Base Metadata (overridden per-page via generateMetadata)             */
/* ------------------------------------------------------------------ */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://upnext.app'
const siteTitle = 'UpNext — AI Interview & Job Portal'
const siteDescription =
  'Ace your next tech interview with AI-powered mock sessions. Find top engineering roles, practice with real-world questions, and get hired faster.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    // Each page can override with: export const metadata = { title: 'My Page' }
    // Rendered as: "My Page | UpNext"
    template: '%s | UpNext',
  },
  description: siteDescription,
  keywords: [
    'AI interview',
    'mock interview',
    'job portal',
    'tech jobs',
    'software engineer jobs',
    'coding interview practice',
    'career development',
  ],
  authors: [{ name: 'UpNext Team', url: siteUrl }],
  creator: 'UpNext',
  publisher: 'UpNext, Inc.',

  /* ----- Open Graph ----- */
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'UpNext',
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'UpNext — AI Interview & Job Portal',
      },
    ],
  },

  /* ----- Twitter / X ----- */
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    site: '@upnextapp',
    creator: '@upnextapp',
    images: ['/og-image.png'],
  },

  /* ----- Robots ----- */
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  /* ----- Icons ----- */
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },

  /* ----- Other ----- */
  manifest: '/site.webmanifest',
  alternates: {
    canonical: siteUrl,
  },
  category: 'technology',
}

/* ------------------------------------------------------------------ */
/* JSON-LD — Organization (site-wide structured data)                  */
/* ------------------------------------------------------------------ */
function OrganizationJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'UpNext',
    url: siteUrl,
    logo: `${siteUrl}/icon.svg`,
    sameAs: [
      'https://twitter.com/upnextapp',
      'https://linkedin.com/company/upnextapp',
    ],
    description: siteDescription,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

/* ------------------------------------------------------------------ */
/* Clerk Appearance — dark theme aligned with UpNext design system     */
/* ------------------------------------------------------------------ */
const clerkAppearance = {
  variables: {
    colorPrimary: '#10B981',       // Emerald 500
    colorBackground: '#09090b',    // Zinc 950
    colorInputBackground: '#18181b', // Zinc 900
    colorInputText: '#fafafa',
    colorText: '#fafafa',
    colorTextSecondary: '#a1a1aa', // Zinc 400
    colorNeutral: '#3f3f46',       // Zinc 700
    borderRadius: '0.75rem',       // rounded-lg
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
  },
  elements: {
    card: 'bg-zinc-900 border border-zinc-800 shadow-xl shadow-black/40',
    headerTitle: 'text-zinc-50 font-semibold',
    headerSubtitle: 'text-zinc-400',
    socialButtonsBlockButton: 'border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700',
    formFieldInput: 'bg-zinc-900 border-zinc-700 text-zinc-50 placeholder:text-zinc-500 focus:border-primary-500',
    formButtonPrimary: 'bg-primary-500 hover:bg-primary-600 text-white font-semibold',
    footerActionLink: 'text-primary-400 hover:text-primary-300',
    identityPreviewEditButton: 'text-primary-400',
    dividerLine: 'bg-zinc-800',
    dividerText: 'text-zinc-500',
  },
} as const

/* ------------------------------------------------------------------ */
/* Root Layout                                                          */
/* ------------------------------------------------------------------ */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider appearance={clerkAppearance}>
      <html lang="en" className={inter.variable} suppressHydrationWarning>
        <head>
          <OrganizationJsonLd />
        </head>
        <body className="flex min-h-dvh flex-col antialiased">
          {/* Skip to main content — accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary-500 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
          >
            Skip to main content
          </a>

          {/* Shell — Navbar */}
          <Navbar />

          {/* Page content — padded to clear fixed navbar */}
          <main id="main-content" className="flex-1 pt-16">
            {children}
          </main>

          {/* Shell — Footer */}
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  )
}
