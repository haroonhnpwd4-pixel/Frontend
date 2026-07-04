import {
  BrainCircuit,
  DatabaseZap,
  FileQuestion,
  LoaderCircle,
  MessageSquareText,
  RefreshCw,
  Send,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { listConversations } from '../api/chat.js'
import { listFiles } from '../api/files.js'
import { askDocumentQuestion, buildFileEmbeddings } from '../api/rag.js'

const processableExtensions = new Set(['pdf', 'docx', 'txt', 'csv'])
const defaultModel = 'tinyllama:latest'
const modelOptions = ['tinyllama:latest', 'deepseek-r1:1.5b']

function getErrorMessage(error, fallback) {
  const detail = error.response?.data?.detail

  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).join(' ')
  }

  if (detail) {
    return detail
  }

  if (error.code === 'ERR_NETWORK') {
    return 'Cannot reach the backend. Make sure FastAPI is running on localhost:8001.'
  }

  return fallback
}

function getExtension(fileName) {
  return fileName.split('.').pop()?.toLowerCase() || 'file'
}

function formatDate(value) {
  if (!value) {
    return ''
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function RagChat() {
  const [files, setFiles] = useState([])
  const [conversations, setConversations] = useState([])
  const [fileId, setFileId] = useState('')
  const [conversationId, setConversationId] = useState('')
  const [provider, setProvider] = useState('ollama')
  const [model, setModel] = useState(defaultModel)
  const [topK, setTopK] = useState(5)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState(null)
  const [embeddingResult, setEmbeddingResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [building, setBuilding] = useState(false)
  const [asking, setAsking] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const documentFiles = useMemo(
    () => files.filter((item) => processableExtensions.has(getExtension(item.file_name))),
    [files],
  )

  const selectedFile = useMemo(
    () => documentFiles.find((item) => item.id === fileId),
    [documentFiles, fileId],
  )

  const refreshData = async () => {
    setLoading(true)
    setError('')

    try {
      const [fileData, conversationData] = await Promise.all([
        listFiles(),
        listConversations(),
      ])
      const docs = fileData.filter((item) =>
        processableExtensions.has(getExtension(item.file_name)),
      )

      setFiles(fileData)
      setConversations(conversationData)
      setFileId((currentId) => {
        if (currentId && docs.some((item) => item.id === currentId)) {
          return currentId
        }

        return docs[0]?.id || ''
      })
      setConversationId((currentId) => {
        if (currentId && conversationData.some((item) => item.id === currentId)) {
          return currentId
        }

        return ''
      })
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, 'Could not load files and conversations.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshData()
  }, [])

  const handleBuildEmbeddings = async () => {
    if (!fileId) {
      setError('Select a processed document first.')
      return
    }

    setBuilding(true)
    setError('')
    setSuccess('')

    try {
      const result = await buildFileEmbeddings(fileId)
      setEmbeddingResult(result)
      setSuccess(
        `Built ${result.chunk_count} embeddings with ${result.embedding_model}.`,
      )
    } catch (caughtError) {
      setError(
        getErrorMessage(
          caughtError,
          'Could not build embeddings. Process the document first and check Ollama.',
        ),
      )
    } finally {
      setBuilding(false)
    }
  }

  const handleAsk = async (event) => {
    event.preventDefault()

    if (!fileId || !question.trim()) {
      return
    }

    setAsking(true)
    setError('')
    setSuccess('')

    try {
      const response = await askDocumentQuestion({
        file_id: fileId,
        question: question.trim(),
        conversation_id: conversationId || null,
        provider,
        model: model.trim() || null,
        top_k: Number(topK),
      })

      setAnswer(response)
      setQuestion('')
    } catch (caughtError) {
      setError(
        getErrorMessage(
          caughtError,
          'Document question failed. Process the file and build embeddings first.',
        ),
      )
    } finally {
      setAsking(false)
    }
  }

  return (
    <section className="page-stack rag-page">
      <div className="page-header">
        <div>
          <span className="eyebrow">RAG</span>
          <h1>Document Q&A</h1>
          <p>Build embeddings and ask focused questions using your uploaded documents.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline-primary" onClick={refreshData} type="button">
            <RefreshCw size={18} />
            Refresh
          </button>
          <button
            className="btn btn-primary"
            disabled={!fileId || building}
            onClick={handleBuildEmbeddings}
            type="button"
          >
            {building ? <LoaderCircle className="spin" size={18} /> : <DatabaseZap size={18} />}
            Build embeddings
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="rag-workspace">
        <aside className="rag-control-panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Controls</span>
              <h2>Retrieval setup</h2>
            </div>
          </div>

          <div className="rag-form-grid">
            <div>
              <label className="form-label" htmlFor="rag-file">
                Document
              </label>
              <select
                className="form-select"
                disabled={loading || documentFiles.length === 0}
                id="rag-file"
                onChange={(event) => {
                  setFileId(event.target.value)
                  setAnswer(null)
                  setEmbeddingResult(null)
                }}
                value={fileId}
              >
                {documentFiles.length === 0 ? (
                  <option value="">No processable documents</option>
                ) : (
                  documentFiles.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.file_name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="form-label" htmlFor="rag-conversation">
                Save to conversation
              </label>
              <select
                className="form-select"
                id="rag-conversation"
                onChange={(event) => setConversationId(event.target.value)}
                value={conversationId}
              >
                <option value="">Do not save</option>
                {conversations.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="rag-two-columns">
              <div>
                <label className="form-label" htmlFor="rag-provider">
                  Provider
                </label>
                <select
                  className="form-select"
                  id="rag-provider"
                  onChange={(event) => setProvider(event.target.value)}
                  value={provider}
                >
                  <option value="ollama">Ollama</option>
                  <option value="openai">OpenAI</option>
                </select>
              </div>

              <div>
                <label className="form-label" htmlFor="rag-top-k">
                  Chunk size
                </label>
                <input
                  className="form-control"
                  id="rag-top-k"
                  max={10}
                  min={1}
                  onChange={(event) => setTopK(event.target.value)}
                  type="number"
                  value={topK}
                />
              </div>
            </div>

            <div>
              <label className="form-label" htmlFor="rag-model">
                Chat model
              </label>
              <select
                className="form-select"
                id="rag-model"
                onChange={(event) => setModel(event.target.value)}
                value={model}
              >
                {modelOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rag-status-card">
            <BrainCircuit size={22} />
            <div>
              <strong>{selectedFile?.file_name || 'No document selected'}</strong>
              <span>
                {embeddingResult
                  ? `${embeddingResult.chunk_count} embedded chunks`
                  : 'Process the file, then build embeddings.'}
              </span>
            </div>
          </div>
        </aside>

        <section className="rag-answer-panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Ask document</span>
              <h2>{selectedFile ? selectedFile.file_name : 'Choose a document'}</h2>
            </div>
          </div>

          <form className="rag-question-form" onSubmit={handleAsk}>
            <textarea
              className="form-control"
              disabled={!fileId || asking}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="What is this document about?"
              rows={3}
              value={question}
            />
            <button
              className="btn btn-primary"
              disabled={!fileId || !question.trim() || asking}
              type="submit"
            >
              {asking ? <LoaderCircle className="spin" size={18} /> : <Send size={18} />}
              Ask
            </button>
          </form>

          {!answer ? (
            <div className="rag-empty">
              <FileQuestion size={46} />
              <h2>Ask a question grounded in your document.</h2>
              <p>
                The backend uses stored chunks, semantic embeddings when available, and
                falls back to keyword ranking when needed.
              </p>
            </div>
          ) : (
            <div className="rag-result">
              <article className="answer-card">
                <div className="message-meta">
                  <strong>Answer</strong>
                  <span>
                    {answer.provider} - {answer.model}
                  </span>
                </div>
                <div className="message-body">
                  <ReactMarkdown>{answer.answer}</ReactMarkdown>
                </div>
              </article>

              <div className="source-section">
                <div className="source-heading">
                  <MessageSquareText size={18} />
                  <strong>Question</strong>
                </div>
                <p>{answer.question}</p>
              </div>

              <div className="source-section">
                <div className="source-heading">
                  <BrainCircuit size={18} />
                  <strong>Sources</strong>
                </div>
                <div className="source-list">
                  {answer.sources.map((source) => (
                    <article className="source-card" key={source.id}>
                      <div>
                        <strong>Chunk {source.chunk_index + 1}</strong>
                        <span>{formatDate(source.created_at)}</span>
                      </div>
                      <p>{source.content}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </section>
  )
}

export default RagChat
