import { useMemo } from 'react'
import { useApp } from '../context/AppContext.jsx'
import {
  SLOTS,
  SIMULATED_TODAY,
  formatDDMMYYYY,
  parseAnyDate,
  getInitials,
  getDoctorShortName,
  getPatientTherapies,
} from '../utils.js'

export default function PatientInfoModal() {
  const app = useApp()
  const patient = app.infoPatient

  const slot = useMemo(() => {
    try {
      if (!patient) return null
      return SLOTS.find((s) => s.id === patient.slotId)
    } catch (e) {
      console.error('Error in slot memo:', e)
      return null
    }
  }, [patient])

  const computed = useMemo(() => {
    try {
      if (!patient) return null
      const startStr = patient.startDate || formatDDMMYYYY(SIMULATED_TODAY)
      const endStr = patient.endDate || formatDDMMYYYY(SIMULATED_TODAY)
      const sDate = parseAnyDate(startStr)
      const eDate = parseAnyDate(endStr)
      let prescribedDays = 7
      if (eDate > sDate) {
        const diff = Math.round((eDate - sDate) / (1000 * 60 * 60 * 24))
        if (diff > 0) prescribedDays = diff
      }

      const elapsed = Math.floor((SIMULATED_TODAY - sDate) / (1000 * 60 * 60 * 24)) + 1
      const currentTodayDay = Math.max(1, Math.min(prescribedDays, elapsed))

      const attendance = patient.attendance && typeof patient.attendance === 'object' ? { ...patient.attendance } : {}
      for (let d = 1; d < currentTodayDay; d++) {
        if (attendance[d] !== 'YES') attendance[d] = 'NO'
      }

      const missedCount = Object.keys(attendance).filter((k) => {
        const dayNum = parseInt(k)
        return dayNum <= currentTodayDay && attendance[k] === 'NO'
      }).length

      const totalDisplayDays = prescribedDays + missedCount

      const therapyText = getPatientTherapies(patient).join(', ') || 'General Panchakarma'

      return { startStr, endStr, prescribedDays, currentTodayDay, attendance, missedCount, totalDisplayDays, therapyText }
    } catch (e) {
      console.error('Error in computed memo:', e)
      return null
    }
  }, [patient])

  const setTodayStatus = async (status) => {
    try {
      if (!patient || !computed) return
      const uin = patient.uin || patient.id
      const updated = { ...computed.attendance, [computed.currentTodayDay]: status }
      await app.saveAttendance(uin, updated)
    } catch (e) {
      console.error('Error in setTodayStatus:', e)
    }
  }

  const close = () => {
    try {
      app.setInfoPatient(null)
    } catch (e) {
      console.error('Error in close:', e)
    }
  }

  if (!patient || !computed) return null

  try {
    const sexAbbr = patient.gender === 'Male' ? 'M' : (patient.gender === 'Female' ? 'F' : 'O')
    const notesLines = (patient.notes || '').split('\n').map((l) => l.trim()).filter((l) => l.length > 0)

    const todayStatus = computed.attendance[computed.currentTodayDay]

    return (
      <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) close() }}>
        <div className="patient-info-card">
          <div className="patient-info-header">
            <div className="patient-avatar-badge">{getInitials(patient.name)}</div>
            <div className="patient-header-details">
              <div className="patient-header-top-row">
                <div className="name-age-sex-group">
                  <h3>{patient.name}</h3>
                  <span className="patient-age-sex-badge">{patient.age}/{sexAbbr}</span>
                </div>
                <div className="header-consultant-group">
                  <span className="consultant-label">Consulting Vaidya</span>
                  <span className="consultant-name">{getDoctorShortName(patient.doctor)}</span>
                </div>
              </div>
              <div className="patient-header-sub-row">
                <span className="status-tag-active">Active Patient</span>
                <span className="patient-id-badge">OPD NO: {(patient.uin || patient.id || 'OPD-001').toUpperCase()}</span>
              </div>
            </div>
            <button className="close-modal-btn" onClick={close}>&times;</button>
          </div>

          <div className="patient-info-body">
            <div className="info-section">
              <h4 className="info-section-title">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                Treatment Details
              </h4>
              <div className="info-grid">
                <div className="info-item"><span className="info-label">Start Date</span><span className="info-value">{computed.startStr}</span></div>
                <div className="info-item"><span className="info-label">End Date</span><span className="info-value">{computed.endStr}</span></div>
                <div className="info-item"><span className="info-label">Time Slot</span><span className="info-value">{slot ? slot.time : '—'}</span></div>
                <div className="info-item"><span className="info-label">No. of Days</span><span className="info-value">{computed.prescribedDays} Days</span></div>
                <div className="info-item"><span className="info-label">Therapy</span><span className="info-value">{computed.therapyText}</span></div>
                <div className="info-item"><span className="info-label">Vaidya</span><span className="info-value">{getDoctorShortName(patient.doctor)}</span></div>
              </div>

              <div className="treatment-days-track-container" style={{ marginTop: 14 }}>
                <span className="info-label">DAY</span>
                <div className="treatment-day-bubbles-wrapper">
                  {Array.from({ length: computed.totalDisplayDays }).map((_, i) => {
                    const d = i + 1
                    const status = computed.attendance[d]
                    const isToday = d === computed.currentTodayDay
                    const isPast = d < computed.currentTodayDay
                    const isExtension = d > computed.prescribedDays
                    const classes = ['day-bubble-item']
                    if (isToday) classes.push('today-highlight')
                    if (isPast && status === 'YES') classes.push('completed-day')
                    if (isPast && status !== 'YES') classes.push('missed-day')
                    if (status === 'YES') classes.push('completed-day')
                    if (status === 'NO') classes.push('missed-day')
                    if (isExtension) classes.push('extension-day')
                    return (
                      <div
                        key={d}
                        className={classes.join(' ')}
                        title={isToday ? `Day ${d} - Today` : isExtension ? `Day ${d} - Extension Day` : `Day ${d}`}
                        style={isExtension ? { borderStyle: 'dashed' } : {}}
                      >
                        {d}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="reported-status-container" style={{ marginTop: 12 }}>
                <span className="info-label">Reported for treatment today</span>
                <div className="reported-buttons-wrapper">
                  <button type="button" className={`reported-btn reported-yes ${todayStatus === 'YES' ? 'active' : ''}`} onClick={() => setTodayStatus('YES')}>YES</button>
                  <button type="button" className={`reported-btn reported-no ${todayStatus === 'NO' ? 'active' : ''}`} onClick={() => setTodayStatus('NO')}>NO</button>
                </div>
              </div>

              <div className="notes-box" style={{ marginTop: 14 }}>
                <span className="info-label">Treatment Plan & Instructions</span>
                {notesLines.length === 0 ? (
                  <div className="notes-content">No instructions provided.</div>
                ) : (
                  notesLines.map((line, idx) => {
                    const clean = line.replace(/^(▶|○|◯|\d+\.)\s*/, '').trim()
                    return (
                      <div key={idx} className="pinfo-notes-line">
                        <span className="pinfo-notes-circle"></span>
                        <span>{clean}</span>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          <div className="patient-info-footer">
            <button type="button" className="primary-action-btn" onClick={close}>Close Info</button>
          </div>
        </div>
      </div>
    )
  } catch (e) {
    console.error('Error in PatientInfoModal render:', e)
    return null
  }
}
