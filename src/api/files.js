import api from './axios.js'

export async function listFiles() {
  const response = await api.get('/files')
  return response.data
}

export async function uploadFile(file) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}

export async function deleteFile(fileId) {
  await api.delete(`/files/${fileId}`)
}

export async function processDocument(fileId) {
  const response = await api.post(`/documents/${fileId}/process`)
  return response.data
}

export async function listDocumentChunks(fileId) {
  const response = await api.get(`/documents/${fileId}/chunks`)
  return response.data
}
