import { useApp } from '../context/AppContext.jsx'

export default function Reports() {
  const app = useApp()

  const backToDashboard = () => {
    try {
      app.setActiveTab('dashboard')
    } catch (e) {
      console.error('Error in backToDashboard:', e)
    }
  }

  return (
    <div className="placeholder-view">
      <div className="placeholder-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
      </div>
      <h3>Hospital Insights & Analytical Reports</h3>
      <p>Download monthly slot occupancy graphs, treatment success rates, and wellness statistics.</p>
      <button className="primary-action-btn back-to-dash-btn" onClick={backToDashboard}>
        Go to Daily Dashboard
      </button>
    </div>
  )
}
