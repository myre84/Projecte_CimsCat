const BACKEND_BASE_URL = 'http://localhost:3000'

// Resolves a media URL, handling both absolute and relative paths
export function resolveMediaUrl(path) {
  if (!path) return ''

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  if (path.startsWith('/')) {
    return `${BACKEND_BASE_URL}${path}`
  }

  return `${BACKEND_BASE_URL}/${path}`
}
