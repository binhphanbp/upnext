/**
 * apiFetch — Typed fetch wrapper for the UpNext NestJS API.
 *
 * Usage:
 *   const data = await apiFetch<PaginatedResponse<DbJob>>('/jobs?page=1')
 *   const job  = await apiFetch<ApiSuccess<DbJob>>(`/jobs/${id}`)
 */

const BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'
).replace(/\/$/, '')

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(`API error ${status}`)
    this.name = 'ApiError'
  }
}

type FetchOptions = RequestInit & {
  /** Bearer token to attach as Authorization header */
  token?: string
}

export async function apiFetch<T>(
  path: string,
  { token, ...init }: FetchOptions = {},
): Promise<T> {
  const url = `${BASE_URL}/${path.replace(/^\//, '')}`

  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(url, { ...init, headers })

  if (!res.ok) {
    let body: unknown
    try {
      body = await res.json()
    } catch {
      body = await res.text()
    }
    throw new ApiError(res.status, body)
  }

  return res.json() as Promise<T>
}
