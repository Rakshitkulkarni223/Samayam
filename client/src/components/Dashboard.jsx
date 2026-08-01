import { useMemo } from 'react'
import { useApp } from '../context/AppContext.jsx'
import {
  SLOTS,
  THERAPIES,
  SIMULATED_TODAY,
  getSlotState,
  getSlotBadgeLabel,
  getPatientsForSlot,
  getPatientTherapies,
  isDateInRange,
} from '../utils.js'

function Metrics() {
  const app = useApp()
  const m = app.metrics

  const cards = [
    { label: 'Total Patients Today', value: m.totalPatientsToday, icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7A9B76" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
    ), change: '12% from yesterday', changeClass: 'positive' },
    { label: 'New Registrations', value: m.newRegistrations, icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8A96B" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="16" y1="11" x2="22" y2="11"></line></svg>
    ), change: 'Registered today', changeClass: 'positive' },
    { label: 'Completed Treatments', value: m.completedTreatments, icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7A9B76" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
    ), change: 'Discharged successfully', changeClass: 'positive' },
    { label: 'Active Treatments', value: m.activeTreatments, icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7CA6A6" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
    ), change: 'Currently in therapy rooms', changeClass: 'neutral' },
    { label: 'Available Slots', value: m.availableSlots, icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7A9B76" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
    ), change: 'Sage Green status', changeClass: 'positive' },
  ]

  return (
    <div className="metrics-grid">
      {cards.map((card, idx) => (
        <div key={idx} className="metric-card">
          <div className="metric-header">
            <span className="metric-label">{card.label}</span>
            <span className="metric-icon">{card.icon}</span>
          </div>
          <div className="metric-value">{card.value}</div>
          <div className={`metric-change ${card.changeClass}`}>
            {card.changeClass === 'positive' && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="18 15 12 9 6 15"></polyline></svg>
            )}
            <span>{card.change}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function SlotsGrid() {
  const app = useApp()

  const handleClick = (slot) => {
    try {
      app.setSelectedSlot(slot.id)
      app.setSelectedDate(SIMULATED_TODAY)
    } catch (e) {
      console.error('Error in slot click:', e)
    }
  }

  return (
    <div className="slots-section">
      <div className="section-title-bar">
        <div className="title-with-desc">
          <h3>Hourly Treatment Slots</h3>
          <p>Daily Panchakarma & Consultation Schedules (6:00 AM - 7:00 PM)</p>
        </div>
        <div className="legend">
          <div className="legend-item"><span className="legend-dot status-available"></span><span>Available</span></div>
          <div className="legend-item"><span className="legend-dot status-nearly-full"></span><span>Nearly Full</span></div>
          <div className="legend-item"><span className="legend-dot status-full"></span><span>Full</span></div>
        </div>
      </div>

      <div className="slots-grid">
        {SLOTS.map((slot) => {
          const count = getPatientsForSlot(app.patients, slot.id, SIMULATED_TODAY).length
          const state = getSlotState(count, slot.capacity)
          const badge = getSlotBadgeLabel(count, slot.capacity)
          const percent = Math.min(100, Math.round((count / slot.capacity) * 100))
          return (
            <div
              key={slot.id}
              className={`slot-card ${state}`}
              data-slot-id={slot.id}
              onClick={() => handleClick(slot)}
            >
              <div className="slot-time-header">
                <span className="slot-hour">{slot.time}</span>
                <span className="slot-badge">{badge}</span>
              </div>
              <div className="slot-ratio-row">
                <span className="ratio-label">Allocated patients</span>
                <span className="ratio-value">{count === slot.capacity ? 'FULL' : `${count}/${slot.capacity}`}</span>
              </div>
              <div className="slot-progress-container">
                <div className="slot-progress-bar" style={{ width: `${percent}%` }}></div>
              </div>
              <div className="slot-footer-action">
                <span>View details</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PanchakarmaPanel() {
  const app = useApp()

  const counts = useMemo(() => {
    try {
      const c = { vamana: 0, virechana: 0, basti: 0, nasya: 0, raktamokshana: 0 }
      const active = app.patients.filter((p) => isDateInRange(SIMULATED_TODAY, p.startDate, p.endDate))
      active.forEach((p) => {
        getPatientTherapies(p).forEach((t) => {
          if (c[t] !== undefined) c[t]++
        })
      })
      return c
    } catch (e) {
      console.error('Error in counts memo:', e)
      return { vamana: 0, virechana: 0, basti: 0, nasya: 0, raktamokshana: 0 }
    }
  }, [app.patients])

  return (
    <div className="panchakarma-sidebar-panel">
      <div className="panel-header-with-gold">
        <h3>Requisition</h3>
        <span className="sanskrit-sub">OPD Entry & Therapy Registrations</span>
      </div>
      <div className="panchakarma-list">
        {THERAPIES.map((t) => {
          const count = counts[t.key]
          const isActive = count > 0
          return (
            <div key={t.key} className="therapy-card" data-therapy={t.key}>
              <div className={`therapy-badge ${t.badgeClass}`}>{t.label}</div>
              <div className="therapy-details">
                <h4>{t.label} Therapy ({t.sanskrit})</h4>
                <p>{t.desc}</p>
                <div className="therapy-stats">
                  <span><strong>{count}</strong> {isActive ? `Active Patient${count > 1 ? 's' : ''}` : 'Scheduled'}</span>
                  <span>• {t.room}</span>
                </div>
              </div>
              <div className="therapy-action-status">
                <span className={`status-pulse ${isActive ? 'active' : 'idle'}`}></span>
                <span className={`status-text ${isActive ? 'text-green' : 'text-gold'}`}>{isActive ? 'Ongoing' : 'Ready'}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="ayurvedic-quote-card">
        <div className="quote-symbol">“</div>
        <p className="quote-text">स्वस्थस्य स्वास्थ्य रक्षणं, आतुरस्य विकार प्रशमनं च।</p>
        <p className="quote-translation">To protect the health of the healthy and cure the disorders of the diseased.</p>
        <span className="quote-source">— Charaka Samhita</span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  let content

  try {
    content = (
      <>
        <Metrics />
        <div className="metrics-slots-divider"></div>
        <div className="content-columns">
          <SlotsGrid />
          <PanchakarmaPanel />
        </div>
      </>
    )
  } catch (e) {
    console.error('Error in Dashboard render:', e)
    content = null
  }

  return content
}
