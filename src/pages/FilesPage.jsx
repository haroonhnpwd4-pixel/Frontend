import {
  Database,
  Download,
  Eye,
  File,
  FileText,
  FileUp,
  FolderOpen,
  LoaderCircle,
  RefreshCw,
  ScissorsLineDashed,
  Trash2,
  UploadCloud,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  deleteFile,
  listDocumentChunks,
  listFiles,
  processDocument,
  uploadFile,
} from '../api/files.js'

const processableExtensions = new Set(['pdf', 'docx', 'txt', 'csv'])

function getErrorMessage(error, fallback) {
  const detail = error.response?.data?.detail

  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).join(' ')
  }

  return detail || fallback
}

function getExtension(fileName) {
  return fileName.split('.').pop()?.toLowerCase() || 'file'
}

function formatDate(value) {
  if (!value) {
    return 'Unknown'
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function FilesPage() {
  const [files, setFiles] = useState([])
  const [selectedFileId, setSelectedFileId] = useState('')
  const [chunks, setChunks] = useState([])
  const [processResult, setProcessResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [processingId, setProcessingId] = useState('')
  const [loadingChunksId, setLoadingChunksId] = useState('')
  const [deletingId, setDeletingId] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef(null)

  const selectedFile = useMemo(
    () => files.find((item) => item.id === selectedFileId),
    [files, selectedFileId],
  )

  const selectedExtension = selectedFile ? getExtension(selectedFile.file_name) : ''
  const canProcessSelected = processableExtensions.has(selectedExtension)

  const refreshFiles = async () => {
    setLoading(true)
    setError('')

    try {
      const data = await listFiles()
      setFiles(data)
      setSelectedFileId((currentId) => {
        if (currentId && data.some((item) => item.id === currentId)) {
          return currentId
        }

        return data[0]?.id || ''
      })
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, 'Could not load files.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshFiles()
  }, [])

  useEffect(() => {
    setChunks([])
    setProcessResult(null)
  }, [selectedFileId])

  const handleUpload = async (event) => {
    const selected = event.target.files?.[0]

    if (!selected) {
      return
    }

    setUploading(true)
    setError('')
    setSuccess('')

    try {
      const uploaded = await uploadFile(selected)
      setFiles((current) => [uploaded, ...current])
      setSelectedFileId(uploaded.id)
      setSuccess(`${uploaded.file_name} uploaded successfully.`)
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, 'File upload failed.'))
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const handleDelete = async (fileId) => {
    setDeletingId(fileId)
    setError('')
    setSuccess('')

    try {
      await deleteFile(fileId)
      setFiles((current) => {
        const next = current.filter((item) => item.id !== fileId)

        if (selectedFileId === fileId) {
          setSelectedFileId(next[0]?.id || '')
        }

        return next
      })
      setSuccess('File deleted.')
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, 'Could not delete file.'))
    } finally {
      setDeletingId('')
    }
  }

  const handleProcess = async (fileId) => {
    setProcessingId(fileId)
    setError('')
    setSuccess('')

    try {
      const result = await processDocument(fileId)
      setProcessResult(result)
      setChunks(result.chunks)
      setSuccess(`${result.file_name} processed into ${result.chunk_count} chunks.`)
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, 'Could not process document.'))
    } finally {
      setProcessingId('')
    }
  }

  const handleViewChunks = async (fileId) => {
    setLoadingChunksId(fileId)
    setError('')
    setSuccess('')

    try {
      const data = await listDocumentChunks(fileId)
      setChunks(data)
      setProcessResult(null)
      setSuccess(data.length ? `Loaded ${data.length} chunks.` : 'No chunks found yet.')
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, 'Could not load document chunks.'))
    } finally {
      setLoadingChunksId('')
    }
  }

  const handleDownload = (item) => {
    setError('')
    setSuccess('')

    if (!item.storage_url?.startsWith('http')) {
      setError('This file does not have a public download URL from the backend yet.')
      return
    }

    window.open(item.storage_url, '_blank', 'noopener,noreferrer')
  }

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <span className="eyebrow">Files</span>
          <h1>Upload center</h1>
          <p>Manage Supabase Storage uploads for PDF, DOCX, TXT, CSV, and images.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline-primary" onClick={refreshFiles} type="button">
            <RefreshCw size={18} />
            Refresh
          </button>
          <button
            className="btn btn-primary"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            {uploading ? <LoaderCircle className="spin" size={18} /> : <FileUp size={18} />}
            Upload file
          </button>
        </div>
        <input
          accept=".pdf,.docx,.txt,.csv,.png,.jpg,.jpeg"
          className="visually-hidden"
          onChange={handleUpload}
          ref={fileInputRef}
          type="file"
        />
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <section className="file-summary-grid">
        <article className="metric-card">
          <FileUp size={18} />
          <div>
            <span>Total files</span>
            <strong>{files.length}</strong>
          </div>
        </article>
        <article className="metric-card">
          <FileText size={18} />
          <div>
            <span>Processable</span>
            <strong>
              {files.filter((item) => processableExtensions.has(getExtension(item.file_name))).length}
            </strong>
          </div>
        </article>
        <article className="metric-card">
          <ScissorsLineDashed size={18} />
          <div>
            <span>Selected chunks</span>
            <strong>{chunks.length}</strong>
          </div>
        </article>
      </section>

      <div className="files-workspace">
        <section className="files-panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Supabase Storage</span>
              <h2>Uploaded files</h2>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">Loading files...</div>
          ) : files.length === 0 ? (
            <div className="file-empty">
              <UploadCloud size={44} />
              <h2>No files uploaded yet.</h2>
              <p>Upload a document or image to start document processing and RAG workflows.</p>
            </div>
          ) : (
            <div className="file-list">
              {files.map((item) => {
                const extension = getExtension(item.file_name)
                const canProcess = processableExtensions.has(extension)
                const isSelected = selectedFileId === item.id

                return (
                  <article className={`file-row ${isSelected ? 'active' : ''}`} key={item.id}>
                    <button
                      className="file-select"
                      onClick={() => setSelectedFileId(item.id)}
                      type="button"
                    >
                      <span className="file-type-icon">
                        <File size={18} />
                      </span>
                      <span>
                        <strong>{item.file_name}</strong>
                        <small>
                          {extension.toUpperCase()} - {formatDate(item.uploaded_at)}
                        </small>
                      </span>
                    </button>

                    <div className="file-actions">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        disabled={!canProcess || processingId === item.id}
                        onClick={() => handleProcess(item.id)}
                        type="button"
                      >
                        {processingId === item.id ? (
                          <LoaderCircle className="spin" size={15} />
                        ) : (
                          <Database size={15} />
                        )}
                        Process
                      </button>
                      <button
                        className="mini-icon-button"
                        onClick={() => handleDownload(item)}
                        type="button"
                        aria-label="Download file"
                      >
                        <Download size={15} />
                      </button>
                      <button
                        className="mini-icon-button"
                        disabled={!canProcess || loadingChunksId === item.id}
                        onClick={() => handleViewChunks(item.id)}
                        type="button"
                        aria-label="View chunks"
                      >
                        {loadingChunksId === item.id ? (
                          <LoaderCircle className="spin" size={15} />
                        ) : (
                          <Eye size={15} />
                        )}
                      </button>
                      <button
                        aria-label="Delete file"
                        className="mini-icon-button danger"
                        disabled={deletingId === item.id}
                        onClick={() => handleDelete(item.id)}
                        type="button"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        <aside className="chunks-panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Document chunks</span>
              <h2>{selectedFile?.file_name || 'Select a file'}</h2>
            </div>
          </div>

          {!selectedFile ? (
            <div className="file-empty">
              <FolderOpen size={42} />
              <h2>No file selected.</h2>
              <p>Select or upload a document to inspect extracted chunks.</p>
            </div>
          ) : !canProcessSelected ? (
            <div className="file-empty">
              <File size={42} />
              <h2>Preview only.</h2>
              <p>Images upload successfully, but only PDF, DOCX, TXT, and CSV can be processed.</p>
            </div>
          ) : chunks.length === 0 ? (
            <div className="file-empty">
              <ScissorsLineDashed size={42} />
              <h2>No chunks loaded.</h2>
              <p>Click Process to extract text, or View Chunks if it was processed before.</p>
            </div>
          ) : (
            <div className="chunk-list">
              {processResult && (
                <div className="process-result">
                  <strong>{processResult.chunk_count} chunks created</strong>
                  <span>{processResult.file_name}</span>
                </div>
              )}
              {chunks.map((chunk) => (
                <article className="chunk-card" key={chunk.id}>
                  <div>
                    <strong>Chunk {chunk.chunk_index + 1}</strong>
                    <span>{formatDate(chunk.created_at)}</span>
                  </div>
                  <p>{chunk.content}</p>
                </article>
              ))}
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}

export default FilesPage
