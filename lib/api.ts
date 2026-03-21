import { cookies } from 'next/headers'

export const API_BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001'

export const apiUrl = (path: string) => `${API_BASE}${path}`

/** Server-side fetch that forwards the Clerk session cookie so protected API routes don't redirect to /login. */
export async function serverFetch(path: string, init?: RequestInit): Promise<Response> {
  const cookieStore = await cookies()
  return fetch(apiUrl(path), {
    ...init,
    headers: {
      ...(init?.headers as Record<string, string> | undefined),
      cookie: cookieStore.toString(),
    },
  })
}
