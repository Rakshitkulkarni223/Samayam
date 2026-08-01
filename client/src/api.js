const TOKEN_KEY = 'samayam_token'
const API_BASE = process.env.REACT_APP_API_BASE_URL || '/api'

function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch (e) {
    console.error('Error in getToken:', e)
    return null
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch (e) {
    console.error('Error in setToken:', e)
  }
}

export async function apiFetch(path, options = {}) {
  try {
    const token = getToken()
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    }

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    })

    if (res.status === 401) {
      setToken(null)
      const err = new Error('Unauthorized')
      err.status = 401
      throw err
    }

    if (!res.ok) {
      let message = `Request failed: ${res.status}`
      try {
        const data = await res.json()
        if (data.error) message = data.error
      } catch {
        void 0
      }
      throw new Error(message)
    }

    return res.json()
  } catch (e) {
    console.error('Error in apiFetch:', e)
    throw e
  }
}

export async function loginUser(username, password) {
  try {
    const data = await apiFetch('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
    if (data.token) setToken(data.token)
    return data
  } catch (e) {
    console.error('Error in loginUser:', e)
    throw e
  }
}

export async function logoutUser() {
  try {
    const token = getToken()
    if (token) {
      try {
        await apiFetch('/logout', {
          method: 'POST',
        })
      } catch {
        void 0
      }
    }
  } catch (e) {
    console.error('Error in logoutUser:', e)
  } finally {
    setToken(null)
  }
}

export async function checkSession() {
  try {
    const token = getToken()
    if (!token) return { authenticated: false }
    return await apiFetch('/session')
  } catch (e) {
    console.error('Error in checkSession:', e)
    if (e.status === 401) setToken(null)
    return { authenticated: false }
  }
}

export async function fetchPatients() {
  try {
    return await apiFetch('/patients')
  } catch (e) {
    console.error('Error in fetchPatients:', e)
    return []
  }
}

export async function savePatient(patient) {
  try {
    return await apiFetch('/patients', {
      method: 'POST',
      body: JSON.stringify(patient),
    })
  } catch (e) {
    console.error('Error in savePatient:', e)
    throw e
  }
}

export async function updateAttendance(uin, attendance) {
  try {
    return await apiFetch('/attendance', {
      method: 'POST',
      body: JSON.stringify({ uin, attendance }),
    })
  } catch (e) {
    console.error('Error in updateAttendance:', e)
    throw e
  }
}
