import {
  FileText,
  MessageSquareText,
} from 'lucide-react'

const stats = [
  {
    label: 'AI Chat',
    value: 'Ready',
    icon: MessageSquareText,
  },
  {
    label: 'RAG Documents',
    value: 'Prepared',
    icon: FileText,
  },
]

function Dashboard() {
  return (
    <section className="page-stack">
      <section className="dashboard-hero">
        <div>
          <span className="eyebrow">DevNexus AI Chat Board</span>
          <h1>Build, chat, upload, and learn with your AI workspace.</h1>
        </div>
      </section>

      <section className="dashboard-metrics">
        {stats.map((item) => {
          const Icon = item.icon

          return (
            <article className="metric-card" key={item.label}>
              <Icon size={24} />
              <div>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            </article>
          )
        })}
      </section>

      <section className="dashboard-grid">
        <article className="feature-card">
          <MessageSquareText size={24} />
          <h2>Chat workflows</h2>
          <p>Conversation history, model choice, and AI responses will live in one focused board.</p>
        </article>
      </section>
    </section>
  )
}

export default Dashboard
