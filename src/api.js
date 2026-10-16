const apiBaseUrl = (import.meta.env?.VITE_API_URL || '').trim().replace(/\/+$/, '')

export const apiUrl = (path) => `${apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`
