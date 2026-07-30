const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!response.ok) throw new Error(`API error: ${response.status}`)
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}
