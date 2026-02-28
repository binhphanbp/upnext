/**
 * Auth Layout — Replaces the root shell (no Navbar/Footer) for
 * /sign-in and /sign-up routes.
 *
 * Uses a centered card layout with a subtle brand gradient background
 * to give the auth pages a distinct, polished feel.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-zinc-950 px-4">
      {/* Decorative radial glow — Emerald 500 at low opacity */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      >
        <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-500/5 blur-[120px]" />
      </div>

      {/* Brand wordmark above the card */}
      <a
        href="/"
        className="mb-8 flex items-center gap-2 transition-opacity hover:opacity-80"
        aria-label="Back to UpNext home"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
          {/* Lightning bolt inline SVG — no extra dep */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4 text-white"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.818a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .845-.143Z"
              clipRule="evenodd"
            />
          </svg>
        </span>
        <span className="text-lg font-semibold tracking-tight text-zinc-50">
          Up<span className="text-primary-500">Next</span>
        </span>
      </a>

      {/* Clerk card will render here */}
      {children}
    </div>
  )
}
