import {
  Bot,
  Check,
  MessageSquarePlus,
  Pencil,
  RefreshCw,
  Send,
  Trash2,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import {
  createConversation,
  deleteConversation,
  listConversations,
  listMessages,
  sendChatMessage,
  updateConversation,
} from '../api/chat.js'

const defaultModel = 'tinyllama:latest'
const modelOptions = ['tinyllama:latest', 'deepseek-r1:1.5b']

function getErrorMessage(error, fallback) {
  const detail = error.response?.data?.detail

  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).join(' ')
  }

  return detail || fallback
}

function formatTime(value) {
  if (!value) {
    return ''
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function ChatBoard() {
  const [conversations, setConversations] = useState([])
  const [activeConversationId, setActiveConversationId] = useState('')
  const [messages, setMessages] = useState([])
  const [provider, setProvider] = useState('ollama')
  const [model, setModel] = useState(defaultModel)
  const [newTitle, setNewTitle] = useState('My First Chat')
  const [message, setMessage] = useState('')
  const [editingId, setEditingId] = useState('')
  const [editingTitle, setEditingTitle] = useState('')
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [creating, setCreating] = useState(false)
  const [sending, setSending] = useState(false)
  const [savingTitle, setSavingTitle] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [error, setError] = useState('')
  const messagesEndRef = useRef(null)

  const activeConversation = useMemo(
    () => conversations.find((item) => item.id === activeConversationId),
    [activeConversationId, conversations],
  )

  const refreshConversations = async () => {
    setLoadingConversations(true)
    setError('')

    try {
      const data = await listConversations()
      setConversations(data)
      setActiveConversationId((currentId) => currentId || data[0]?.id || '')
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, 'Could not load conversations.'))
    } finally {
      setLoadingConversations(false)
    }
  }

  useEffect(() => {
    refreshConversations()
  }, [])

  useEffect(() => {
    if (!activeConversationId) {
      setMessages([])
      return
    }

    let isCurrent = true
    setLoadingMessages(true)
    setError('')

    listMessages(activeConversationId)
      .then((data) => {
        if (isCurrent) {
          setMessages(data)
        }
      })
      .catch((caughtError) => {
        if (isCurrent) {
          setError(getErrorMessage(caughtError, 'Could not load messages.'))
        }
      })
      .finally(() => {
        if (isCurrent) {
          setLoadingMessages(false)
        }
      })

    return () => {
      isCurrent = false
    }
  }, [activeConversationId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  const handleCreateConversation = async (event) => {
    event.preventDefault()
    setCreating(true)
    setError('')

    try {
      const conversation = await createConversation({
        title: newTitle.trim() || 'New Chat',
        model: model.trim() || defaultModel,
      })

      setConversations((current) => [conversation, ...current])
      setActiveConversationId(conversation.id)
      setNewTitle('New Chat')
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, 'Could not create conversation.'))
    } finally {
      setCreating(false)
    }
  }

  const handleRename = async (conversationId) => {
    if (!editingTitle.trim()) {
      return
    }

    setSavingTitle(true)
    setError('')

    try {
      const updated = await updateConversation(conversationId, {
        title: editingTitle.trim(),
      })
      setConversations((current) =>
        current.map((item) => (item.id === conversationId ? updated : item)),
      )
      setEditingId('')
      setEditingTitle('')
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, 'Could not rename conversation.'))
    } finally {
      setSavingTitle(false)
    }
  }

  const handleDelete = async (conversationId) => {
    setDeletingId(conversationId)
    setError('')

    try {
      await deleteConversation(conversationId)
      setConversations((current) => {
        const next = current.filter((item) => item.id !== conversationId)

        if (conversationId === activeConversationId) {
          setActiveConversationId(next[0]?.id || '')
        }

        return next
      })
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, 'Could not delete conversation.'))
    } finally {
      setDeletingId('')
    }
  }

  const handleSend = async (event) => {
    event.preventDefault()

    if (!message.trim() || sending) {
      return
    }

    let conversationId = activeConversationId
    setSending(true)
    setError('')

    try {
      if (!conversationId) {
        const conversation = await createConversation({
          title: message.trim().slice(0, 80),
          model: model.trim() || defaultModel,
        })
        conversationId = conversation.id
        setConversations((current) => [conversation, ...current])
        setActiveConversationId(conversation.id)
      }

      const response = await sendChatMessage({
        conversation_id: conversationId,
        provider,
        model: model.trim() || null,
        message: message.trim(),
      })

      setMessages((current) => [
        ...current,
        response.user_message,
        response.assistant_message,
      ])
      setMessage('')
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, 'AI chat failed. Check backend, Ollama, or API keys.'))
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="page-stack chat-page">
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="chat-workspace">
        <aside className="chat-sidebar-panel">
          <form className="new-chat-form" onSubmit={handleCreateConversation}>
            <label className="form-label" htmlFor="new-chat-title">
              New conversation
            </label>
            <div className="input-group">
              <input
                className="form-control"
                id="new-chat-title"
                maxLength={120}
                onChange={(event) => setNewTitle(event.target.value)}
                placeholder="My First Chat"
                value={newTitle}
              />
              <button className="btn btn-primary" disabled={creating} type="submit">
                <MessageSquarePlus size={18} />
              </button>
            </div>
          </form>

          <div className="conversation-toolbar">
            <strong>Conversations</strong>
            <div className="conversation-toolbar-actions">
              <span>{conversations.length}</span>
              <button
                aria-label="Refresh conversations"
                className="mini-icon-button"
                onClick={refreshConversations}
                type="button"
              >
                <RefreshCw size={15} />
              </button>
            </div>
          </div>

          <div className="conversation-scroll">
            {loadingConversations ? (
              <div className="empty-state">Loading conversations...</div>
            ) : conversations.length === 0 ? (
              <div className="empty-state">Create a chat to begin.</div>
            ) : (
              conversations.map((conversation) => (
                <article
                  className={`conversation-row ${
                    conversation.id === activeConversationId ? 'active' : ''
                  }`}
                  key={conversation.id}
                >
                  {editingId === conversation.id ? (
                    <div className="rename-row">
                      <input
                        autoFocus
                        className="form-control form-control-sm"
                        maxLength={120}
                        onChange={(event) => setEditingTitle(event.target.value)}
                        value={editingTitle}
                      />
                      <button
                        aria-label="Save title"
                        className="mini-icon-button"
                        disabled={savingTitle}
                        onClick={() => handleRename(conversation.id)}
                        type="button"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        aria-label="Cancel rename"
                        className="mini-icon-button"
                        onClick={() => {
                          setEditingId('')
                          setEditingTitle('')
                        }}
                        type="button"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        className="conversation-select"
                        onClick={() => setActiveConversationId(conversation.id)}
                        type="button"
                      >
                        <strong>{conversation.title}</strong>
                        <span>{conversation.model}</span>
                      </button>
                      <div className="conversation-actions">
                        <button
                          aria-label="Rename conversation"
                          className="mini-icon-button"
                          onClick={() => {
                            setEditingId(conversation.id)
                            setEditingTitle(conversation.title)
                          }}
                          type="button"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          aria-label="Delete conversation"
                          className="mini-icon-button danger"
                          disabled={deletingId === conversation.id}
                          onClick={() => handleDelete(conversation.id)}
                          type="button"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </>
                  )}
                </article>
              ))
            )}
          </div>
        </aside>

        <div className="chat-main-panel">
          <div className="chat-controls">
            <div>
              <span className="eyebrow">Active chat</span>
              <strong>{activeConversation?.title || 'No conversation selected'}</strong>
            </div>
            <div className="chat-control-grid">
              <div>
                <label className="form-label" htmlFor="provider">
                  Provider
                </label>
                <select
                  className="form-select"
                  id="provider"
                  onChange={(event) => setProvider(event.target.value)}
                  value={provider}
                >
                  <option value="ollama">Ollama</option>
                  <option value="openai">OpenAI</option>
                </select>
              </div>
              <div>
                <label className="form-label" htmlFor="model">
                  Model
                </label>
                <select
                  className="form-select"
                  id="model"
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
          </div>

          <div className="message-thread" aria-live="polite">
            {loadingMessages ? (
              <div className="empty-state">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="chat-empty">
                <Bot size={42} />
                <h2>Start a conversation with DevNexus AI.</h2>
                <p>
                  Use Ollama with `tinyllama:latest`, or switch provider when OpenAI is
                  configured in your backend.
                </p>
              </div>
            ) : (
              messages.map((item) => (
                <article className={`message-bubble ${item.role}`} key={item.id}>
                  <div className="message-meta">
                    <strong>{item.role === 'user' ? 'You' : 'Assistant'}</strong>
                    <span>{formatTime(item.created_at)}</span>
                  </div>
                  <div className="message-body">
                    <ReactMarkdown>{item.content}</ReactMarkdown>
                  </div>
                </article>
              ))
            )}

            {sending && (
              <article className="message-bubble assistant">
                <div className="message-meta">
                  <strong>Assistant</strong>
                  <span>thinking</span>
                </div>
                <div className="typing-indicator">
                  <span />
                  <span />
                  <span />
                </div>
              </article>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="message-composer" onSubmit={handleSend}>
            <textarea
              className="form-control"
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  handleSend(event)
                }
              }}
              placeholder="Explain FastAPI in simple words."
              rows={2}
              value={message}
            />
            <button
              className="btn btn-primary"
              disabled={!message.trim() || sending}
              type="submit"
            >
              <Send size={18} />
              Send
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default ChatBoard
