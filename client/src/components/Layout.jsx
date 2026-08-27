import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import Dashboard from './Dashboard.jsx'
import Scheduler from './Scheduler.jsx'
import PatientsDirectory from './PatientsDirectory.jsx'
import OPDEntry from './OPDEntry.jsx'
import Reports from './Reports.jsx'
import Settings from './Settings.jsx'
import RegisterModal from './RegisterModal.jsx'
import PatientInfoModal from './PatientInfoModal.jsx'
import SlotDrawer from './SlotDrawer.jsx'
import { formatDDMMYYYY, getInitials } from '../utils.js'

function Background() {
  let content

  try {
    content = (
      <div className="bg-patterns-container">
        <div className="kalachakra-watermark">
          <svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
            <circle cx="400" cy="400" r="380" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="8, 4" />
            <circle cx="400" cy="400" r="350" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="400" cy="400" r="340" fill="none" stroke="currentColor" strokeWidth="2" />
            <g stroke="currentColor" strokeWidth="1">
              <line x1="400" y1="50" x2="400" y2="750" />
              <line x1="50" y1="400" x2="750" y2="400" />
              <line x1="152.5" y1="152.5" x2="647.5" y2="647.5" />
              <line x1="152.5" y1="647.5" x2="647.5" y2="152.5" />
              <line x1="226.8" y1="100" x2="573.2" y2="700" />
              <line x1="100" y1="226.8" x2="700" y2="573.2" />
              <line x1="573.2" y1="100" x2="226.8" y2="700" />
              <line x1="100" y1="573.2" x2="700" y2="226.8" />
            </g>
            <circle cx="400" cy="400" r="280" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="15, 10" />
            <circle cx="400" cy="400" r="200" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="400" cy="400" r="120" fill="none" stroke="currentColor" strokeWidth="1" />
            <path d="M 400 340 C 420 370, 440 370, 400 400 C 360 370, 380 370, 400 340 Z" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M 400 460 C 420 430, 440 430, 400 400 C 360 430, 380 430, 400 460 Z" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M 340 400 C 370 420, 370 440, 400 400 C 370 360, 370 380, 340 400 Z" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M 460 400 C 430 420, 430 440, 400 400 C 430 360, 430 380, 460 400 Z" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M 357.6 357.6 C 385 380, 395 390, 400 400 C 390 395, 380 385, 357.6 357.6 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M 442.4 442.4 C 415 420, 405 410, 400 400 C 410 405, 420 415, 442.4 442.4 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M 357.6 442.4 C 380 415, 390 405, 400 400 C 395 410, 385 420, 357.6 442.4 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M 442.4 357.6 C 420 385, 410 395, 400 400 C 405 390, 415 380, 442.4 357.6 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="400" cy="400" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <div className="flowing-lines-bg">
          <svg viewBox="0 0 1440 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M-100,200 C300,100 500,400 900,300 C1200,220 1300,450 1600,350" stroke="currentColor" strokeDasharray="10, 5" strokeOpacity="0.2" strokeWidth="2" />
            <path d="M-100,250 C400,150 600,450 1000,350 C1300,270 1400,500 1700,400" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
          </svg>
        </div>
      </div>
    )
  } catch (e) {
    console.error('Error in Background:', e)
    content = null
  }

  return content
}

function Sidebar({ mobileOpen, onNavClick }) {
  const app = useApp()
  const navigate = useNavigate()

  const tabs = [
    { id: 'dashboard', label: 'Overview', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
    )},
    { id: 'scheduler', label: 'Slot Scheduler', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
    )},
    { id: 'patients', label: 'Patients', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
    )},
    { id: 'panchakarma', label: 'Requisition', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
    )},
    { id: 'reports', label: 'Reports', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
    )},
    { id: 'settings', label: 'Settings', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
    )},
  ]

  const handleLogout = async () => {
    try {
      await app.logout()
      navigate('/login', { replace: true })
    } catch (e) {
      console.error('Error in handleLogout:', e)
    }
  }

  const handleNavClick = (tabId) => {
    try {
      app.setActiveTab(tabId)
      if (onNavClick) onNavClick()
    } catch (e) {
      console.error('Error in tab click:', e)
    }
  }

  return (
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="brand">
        <div className="brand-logo">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="dhanwantari-logo">
            <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3, 2, 1, 3" opacity="0.6" />
            <circle cx="50" cy="50" r="43" stroke="currentColor" strokeWidth="0.8" strokeDasharray="8, 4" opacity="0.4" />
            <path d="M38,36 C38,34 62,34 62,36 C62,38 38,38 38,36 Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M42,36 C42,42 40,44 34,50" stroke="currentColor" strokeWidth="1.4" />
            <path d="M58,36 C58,42 60,44 66,50" stroke="currentColor" strokeWidth="1.4" />
            <path d="M34,50 C26,58 26,72 50,72 C74,72 74,58 66,50" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M42,72 C42,75 58,75 58,72" stroke="currentColor" strokeWidth="1.4" />
            <path d="M31,56 C38,62 62,62 69,56" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2, 2" />
            <path d="M29,62 C38,68 62,68 71,62" stroke="currentColor" strokeWidth="0.8" />
            <path d="M50,34 C50,22 50,20 50,14 C50,20 53,24 50,34 Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            <path d="M46,34 C40,28 36,26 36,22 C42,24 45,28 46,34 Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            <path d="M54,34 C60,28 64,26 64,22 C58,24 55,28 54,34 Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            <path d="M28,68 C26,74 36,86 50,86 C64,86 74,74 72,68" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M32,74 C34,78 40,82 50,82 C60,82 66,78 68,74" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3, 3" />
            <path d="M40,86 C40,92 50,95 50,95 C50,95 60,92 60,86" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            <path d="M34,84 C30,90 44,92 50,92 C56,92 70,90 66,84" stroke="currentColor" strokeWidth="1" />
          </svg>
        </div>
        <div className="brand-text">
          <h2 className="system-title">SAMAYAM</h2>
          <span className="system-sanskrit">समय</span>
        </div>
      </div>
      <p className="tagline">Panchakarma Slot Management</p>

      <nav className="sidebar-nav">
        <ul>
          {tabs.map((tab) => (
            <li key={tab.id} className={app.activeTab === tab.id ? 'active' : ''}>
              <a href="#" onClick={(e) => { e.preventDefault(); handleNavClick(tab.id) }}>
                <span className="icon">{tab.icon}</span>
                <span>{tab.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="footer-user">
          <div className="footer-avatar">{getInitials(app.user || 'User')}</div>
          <div className="footer-user-info">
            <span className="user-name">{app.user || 'User'}</span>
            <span className="user-role">Admin</span>
          </div>
        </div>
        <div className="footer-meta">
          <span>{formatDDMMYYYY(new Date())}</span>
          <button className="secondary-btn" onClick={handleLogout} style={{ padding: '6px 12px', fontSize: '0.72rem' }}>
            Logout
          </button>
        </div>
      </div>
    </aside>
  )
}

function Header({ onMenuToggle }) {
  const app = useApp()
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')
  const [query, setQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const searchBoxRef = useRef(null)

  useEffect(() => {
    const update = () => {
      try {
        const now = new Date()
        const hh = String(now.getHours()).padStart(2, '0')
        const mm = String(now.getMinutes()).padStart(2, '0')
        const ss = String(now.getSeconds()).padStart(2, '0')
        setTime(`${hh}:${mm}:${ss}`)
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        setDate(`${days[now.getDay()]}, ${formatDDMMYYYY(now)}`)
      } catch (e) {
        console.error('Error in clock update:', e)
      }
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const handleClick = (e) => {
      try {
        if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
          setShowResults(false)
        }
      } catch (e) {
        console.error('Error in document click:', e)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const tabTitleMap = {
    dashboard: 'Dashboard Overview',
    scheduler: 'Slot Allocator Workspace',
    patients: 'Patients',
    panchakarma: 'Requisition (OPD Entry Form)',
    reports: 'Analytical Reports',
    settings: 'System Settings & Parameters',
  }

  const matches = useMemo(() => {
    try {
      if (!query.trim()) return []
      const q = query.toLowerCase()
      const out = []
      app.patients.forEach((p) => {
        if ((p.name && p.name.toLowerCase().includes(q)) || (p.id && p.id.toLowerCase().includes(q)) || (p.uin && p.uin.toLowerCase().includes(q))) {
          out.push(p)
        }
      })
      return out.slice(0, 6)
    } catch (e) {
      console.error('Error in matches:', e)
      return []
    }
  }, [query, app.patients])

  const openPatient = (p) => {
    try {
      app.setInfoPatient(p)
      setQuery('')
      setShowResults(false)
    } catch (e) {
      console.error('Error in openPatient:', e)
    }
  }

  const openRegister = () => {
    try {
      app.setRegisterOpen(true)
    } catch (e) {
      console.error('Error opening register:', e)
    }
  }

  let headerContent

  try {
    headerContent = (
      <header className="workspace-header">
        <div className="header-left">
          <button className="mobile-menu-toggle" onClick={onMenuToggle} aria-label="Toggle menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <div className="breadcrumb">
            <span className="root-breadcrumb">SAMAYAM</span>
            {app.activeTab !== 'dashboard' && (
              <>
                <span className="divider">/</span>
                <span className="active-breadcrumb">{tabTitleMap[app.activeTab]}</span>
              </>
            )}
          </div>
          <div className="search-box" ref={searchBoxRef}>
            <span className="search-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </span>
            <input
              type="text"
              placeholder="OPD NO SEARCH"
              value={query}
              onChange={(e) => { try { setQuery(e.target.value); setShowResults(true) } catch (err) { console.error('Error in search change:', err) } }}
              onFocus={() => { try { if (query.trim()) setShowResults(true) } catch (err) { console.error('Error in search focus:', err) } }}
            />
            {showResults && matches.length > 0 && (
              <div
                style={{
                  position: 'absolute', top: '100%', left: 0, width: '100%', maxHeight: 240, overflowY: 'auto',
                  background: 'var(--soft-cream)', border: '1px solid var(--border-light)', borderRadius: 8,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)', marginTop: 6, zIndex: 150, padding: '4px 0',
                }}
              >
                {matches.map((p) => (
                  <div
                    key={p.id || p.uin}
                    onClick={() => openPatient(p)}
                    onMouseEnter={(e) => { try { e.currentTarget.style.background = 'rgba(122,155,118,0.08)' } catch (err) { console.error('Error in result hover:', err) } }}
                    onMouseLeave={(e) => { try { e.currentTarget.style.background = 'transparent' } catch (err) { console.error('Error in result leave:', err) } }}
                    style={{ padding: '10px 14px', fontSize: '0.85rem', cursor: 'pointer', color: 'var(--text-dark)' }}
                  >
                    <div style={{ fontWeight: 700, color: 'var(--deep-green)' }}>{p.name} <span style={{ color: 'var(--gold)', fontSize: '0.72rem' }}>({p.id || p.uin})</span></div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Slot: {p.slotId} • {p.doctor ? p.doctor.split(' (')[0] : '—'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="header-right">
          <div className="dynamic-clock-container">
            <div className="clock-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <div className="time-readout">
              <div className="digital-time">{time}</div>
              <div className="digital-date">{date}</div>
            </div>
          </div>

          <div className="header-actions">
            <button className="action-btn notifications-badge" aria-label="Notifications">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              <span className="badge-count">3</span>
            </button>
            <button className="register-trigger-btn" onClick={openRegister}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              <span>Quick Register</span>
            </button>
          </div>
        </div>
      </header>
    )
  } catch (e) {
    console.error('Error in Header render:', e)
    headerContent = null
  }

  return headerContent
}

export default function Layout() {
  const app = useApp()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const tabClass = (id) => `tab-pane ${app.activeTab === id ? 'active' : ''}`

  const closeMobileMenu = () => {
    try {
      setMobileMenuOpen(false)
    } catch (e) {
      console.error('Error in closeMobileMenu:', e)
    }
  }

  // Close sidebar on tab change (mobile)
  useEffect(() => {
    try {
      setMobileMenuOpen(false)
    } catch (e) {
      console.error('Error closing mobile menu on tab change:', e)
    }
  }, [app.activeTab])

  let content

  try {
    content = (
      <div className="app-layout">
        <Background />
        {/* Mobile sidebar backdrop */}
        <div className={`sidebar-backdrop ${mobileMenuOpen ? 'visible' : ''}`} onClick={closeMobileMenu}></div>
        <Sidebar mobileOpen={mobileMenuOpen} onNavClick={closeMobileMenu} />
        <main className="main-workspace">
          <Header onMenuToggle={() => { try { setMobileMenuOpen((v) => !v) } catch (e) { console.error('Error toggling menu:', e) } }} />
          <div className="dashboard-scrollable">
            <section className={tabClass('dashboard')}>
              <Dashboard />
            </section>
            <section className={tabClass('scheduler')}>
              <Scheduler />
            </section>
            <section className={tabClass('patients')}>
              <PatientsDirectory />
            </section>
            <section className={tabClass('panchakarma')}>
              <OPDEntry />
            </section>
            <section className={tabClass('reports')}>
              <Reports />
            </section>
            <section className={tabClass('settings')}>
              <Settings />
            </section>
          </div>
        </main>

        <SlotDrawer />
        <RegisterModal />
        <PatientInfoModal />
      </div>
    )
  } catch (e) {
    console.error('Error in Layout render:', e)
    content = <div>Layout error</div>
  }

  return content
}
