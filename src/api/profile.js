import api from './axios.js'

export async function updateProfile(payload) {
  const response = await api.patch('/auth/me', payload)
  return response.data
}

export async function changePassword(payload) {
  const response = await api.post('/auth/change-password', payload)
  return response.data
}

export async function requestPasswordReset(payload) {
  const response = await api.post('/auth/forgot-password', payload)
  return response.data
}
