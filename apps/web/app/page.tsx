import type { Metadata } from 'next'
import {
  HeroSection,
  FeaturesSection,
  StatsSection,
  CtaSection,
} from '@/components/landing-page'

/* ------------------------------------------------------------------ */
/* Metadata — optimised for Lighthouse SEO + social sharing            */
/* ------------------------------------------------------------------ */

const pageTitle = 'UpNext — AI Interview Practice & Job Portal for Engineers'
const pageDescription =
  'Practice realistic AI-powered mock interviews, get instant scored feedback, and discover curated engineering roles. Join 12,000+ engineers who landed their dream job with UpNext.'

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: [
    'AI mock interview',
    'software engineer interview prep',
    'coding interview practice',
    'tech job portal',
    'AI interview feedback',
    'system design interview',
    'behavioral interview practice',
    'software engineering jobs',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: '/',
    title: pageTitle,
    description: pageDescription,
    images: [
      {
        url: '/og-home.png',
        width: 1200,
        height: 630,
        alt: 'UpNext — AI Interview Practice & Job Portal',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: pageTitle,
    description: pageDescription,
    images: ['/og-home.png'],
  },
}

/* ------------------------------------------------------------------ */
/* JSON-LD — WebSite + SearchAction (enables sitelinks search box)      */
/* ------------------------------------------------------------------ */

function HomeJsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://upnext.app'

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'UpNext',
    url: siteUrl,
    description: pageDescription,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/jobs?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

/**
 * HomePage — Server Component.
 *
 * Composes independent section components. Interactive sections
 * (FeaturesSection, StatsSection) declare 'use client' internally —
 * this page itself stays a pure RSC for maximum initial load performance.
 */
export default function HomePage() {
  return (
    <>
      <HomeJsonLd />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <CtaSection />
    </>
  )
}
