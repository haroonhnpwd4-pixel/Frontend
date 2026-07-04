import { Megaphone, WandSparkles } from 'lucide-react'

function SocialPostGenerator() {
  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <span className="eyebrow">Generator</span>
          <h1>Social post studio</h1>
          <p>Create platform-ready posts for LinkedIn and other social channels.</p>
        </div>
        <button className="btn btn-primary" type="button">
          <WandSparkles size={18} />
          Generate
        </button>
      </div>

      <div className="module-placeholder">
        <Megaphone size={44} />
        <h2>Social content controls will connect to the post API.</h2>
        <p>Topic, platform, tone, provider, and model controls will live here.</p>
      </div>
    </section>
  )
}

export default SocialPostGenerator
