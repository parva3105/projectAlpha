export const API_BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001'

export const apiUrl = (path: string) => `${API_BASE}${path}`
