// Small wrapper around fetch. Adds the Bearer token and handles JSON.
import { getToken, clearAuth } from './auth'

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch('/api' + path, { ...options, headers })

  // If our token is rejected while logged in, the session has expired:
  // clear it and send the user back to login.
  if (res.status === 401 && token) {
    clearAuth()
    window.location.href = '/login'
    return
  }

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error((data && data.error) || 'Something went wrong')
  }
  return data
}

export function login(username, password) {
  return request('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export function fetchClusters(scope) {
  return request('/clusters?scope=' + scope)
}

export function deleteCluster(id) {
  return request('/clusters/' + id, { method: 'DELETE' })
}
