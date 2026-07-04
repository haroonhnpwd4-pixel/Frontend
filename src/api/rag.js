import api from './axios.js'

export async function buildFileEmbeddings(fileId) {
  const response = await api.post(`/rag/files/${fileId}/embeddings`)
  return response.data
}

export async function askDocumentQuestion(payload) {
  const response = await api.post('/rag/chat', payload)
  return response.data
}
