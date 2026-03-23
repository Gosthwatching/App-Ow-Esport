const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export async function apiRequest<T>(
  path: string,
  method: string,
  body?: Record<string, unknown>,
  token?: string,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const message = payload?.message ?? 'Erreur API'
    throw new Error(Array.isArray(message) ? message.join(', ') : String(message))
  }

  return payload as T
}
