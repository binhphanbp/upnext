import type { Metadata } from 'next'
import { currentUser } from '@clerk/nextjs/server'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your UpNext dashboard',
  robots: { index: false, follow: false },
}

export default async function DashboardPage() {
  const user = await currentUser()

  return (
    <section className="container-page py-16">
      <h1 className="text-3xl font-bold text-zinc-50">
        Welcome back,{' '}
        <span className="text-primary-500">{user?.firstName ?? 'there'}</span> 👋
      </h1>
      <p className="mt-3 text-zinc-400">
        Your AI-powered interview dashboard is coming soon.
      </p>
    </section>
  )
}
