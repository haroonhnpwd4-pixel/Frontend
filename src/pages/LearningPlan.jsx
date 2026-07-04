import { BookOpenCheck, CalendarDays } from 'lucide-react'

function LearningPlan() {
  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <span className="eyebrow">Learning</span>
          <h1>Learning plan builder</h1>
          <p>Generate study paths by topic, level, and duration.</p>
        </div>
        <button className="btn btn-primary" type="button">
          <CalendarDays size={18} />
          Create plan
        </button>
      </div>

      <div className="module-placeholder">
        <BookOpenCheck size={44} />
        <h2>Learning assistant page is ready for API integration.</h2>
        <p>The final tool will call `/api/v1/ai/learn` and render a clean weekly plan.</p>
      </div>
    </section>
  )
}

export default LearningPlan
