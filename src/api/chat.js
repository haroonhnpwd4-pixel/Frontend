import api from './axios.js'

export async function listConversations() {
  const response = await api.get('/conversations')
  return response.data
}

export async function createConversation(payload) {
  const response = await api.post('/conversations', payload)
  return response.data
}

export async function updateConversation(conversationId, payload) {
  const response = await api.patch(`/conversations/${conversationId}`, payload)
  return response.data
}

export async function deleteConversation(conversationId) {
  await api.delete(`/conversations/${conversationId}`)
}

export async function listMessages(conversationId) {
  const response = await api.get(`/messages/${conversationId}`)
  return response.data
}

export async function sendChatMessage(payload) {
  const response = await api.post('/ai/chat', payload)
  return response.data
}
