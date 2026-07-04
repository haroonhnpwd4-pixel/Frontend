import { Bot, FileQuestion, LogIn, MessageSquareText, UserPlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'

function Home() {
  const { isAuthenticated } = useAuth()

  return (
    <main className="home-page">
      <section className="home-hero">
        <div>
          <span className="eyebrow">DevNexus AI Chat Board</span>
          <h1>Your AI workspace for chats, files, and document answers.</h1>
          <p>
            Sign in to manage conversations, upload documents, generate embeddings,
            and ask questions grounded in your files.
          </p>
          <div className="home-actions">
            {isAuthenticated ? (
              <Link className="btn btn-primary" to="/dashboard">
                <Bot size={18} />
                Open dashboard
              </Link>
            ) : (
              <>
                <Link className="btn btn-primary" to="/login">
                  <LogIn size={18} />
                  Sign in
                </Link>
                <Link className="btn btn-outline-primary" to="/register">
                  <UserPlus size={18} />
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="home-preview" aria-label="DevNexus feature preview">
          <article>
            <MessageSquareText size={22} />
            <strong>AI Chat</strong>
            <span>Conversation history with Ollama or OpenAI.</span>
          </article>
          <article>
            <FileQuestion size={22} />
            <strong>Document Q&A</strong>
            <span>Ask questions using processed chunks and embeddings.</span>
          </article>
        </div>
      </section>
    </main>
  )
}

export default Home
