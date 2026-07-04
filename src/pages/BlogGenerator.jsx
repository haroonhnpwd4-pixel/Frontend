import { Newspaper, WandSparkles } from 'lucide-react'

function BlogGenerator() {
  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <span className="eyebrow">Generator</span>
          <h1>Blog assistant</h1>
          <p>Generate structured blog drafts by topic, audience, tone, and word count.</p>
        </div>
        <button className="btn btn-primary" type="button">
          <WandSparkles size={18} />
          Generate
        </button>
      </div>

      <div className="module-placeholder">
        <Newspaper size={44} />
        <h2>Blog generation form comes after the chat and file modules.</h2>
        <p>It will call `/api/v1/ai/generate-blog` with provider and model controls.</p>
      </div>
    </section>
  )
}

export default BlogGenerator
