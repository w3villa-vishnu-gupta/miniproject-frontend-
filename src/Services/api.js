const defaultHost =
  typeof window !== 'undefined' && window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8000'
    : 'http://localhost:8000'

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || defaultHost
).replace(/\/+$/, '')

export function getApiUrl(path = '') {
  return `${API_BASE_URL}${path.startsWith('/') || !path ? path : `/${path}`}`
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

async function request(path, options = {}) {
  const { body, headers: providedHeaders, ...fetchOptions } = options
  const headers = new Headers(providedHeaders)
  headers.set('Accept', headers.get('Accept') || 'application/json')

  // Automatically attach Bearer token from localStorage if not already provided
  const savedToken =
    typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
  if (savedToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${savedToken}`)
  }

  let requestBody = body
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
  const isUrlEncoded =
    typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams
  const isBlob = typeof Blob !== 'undefined' && body instanceof Blob

  if (
    body !== undefined &&
    body !== null &&
    typeof body === 'object' &&
    !isFormData &&
    !isUrlEncoded &&
    !isBlob
  ) {
    requestBody = JSON.stringify(body)
    headers.set('Content-Type', headers.get('Content-Type') || 'application/json')
  }

  const response = await fetch(getApiUrl(path), {
    ...fetchOptions,
    headers,
    body: requestBody,
  })

  let data = null
  if (response.status !== 204) {
    const contentType = response.headers.get('content-type') || ''
    data = contentType.includes('application/json')
      ? await response.json()
      : await response.text()
  }

  if (!response.ok) {
    const rawError =
      typeof data === 'object' && data !== null
        ? data.detail || data.message || data.error
        : data

    let message = ''
    if (typeof rawError === 'string' && rawError.trim()) {
      message = rawError
    } else if (Array.isArray(rawError)) {
      message = rawError
        .map((item) => {
          if (typeof item === 'string') return item
          const field = Array.isArray(item.loc) ? item.loc.slice(1).join('.') : ''
          return field ? `${field}: ${item.msg || 'Invalid field'}` : item.msg || JSON.stringify(item)
        })
        .join(', ')
    } else if (rawError && typeof rawError === 'object') {
      message = rawError.msg || rawError.message || JSON.stringify(rawError)
    } else {
      message = response.statusText || `Request failed with status ${response.status}`
    }

    throw new ApiError(message, response.status, data)
  }

  return data
}

export const api = {
  get: (path, options = {}) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options = {}) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options = {}) => request(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options = {}) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options = {}) => request(path, { ...options, method: 'DELETE' }),
}
