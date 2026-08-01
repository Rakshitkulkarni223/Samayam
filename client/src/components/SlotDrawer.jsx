import { useApp } from '../context/AppContext.jsx'
import {
  SLOTS,
  getSlotState,
  getSlotBadgeLabel,
  getPatientsForSlot,
  getDoctorShortName,
  formatDDMMYYYY,
} from '../utils.js'

export default function SlotDrawer() {
  const app = useApp()
  const slot = SLOTS.find((s) => s.id === app.selectedSlot)
  const open = Boolean(slot)
  const date = app.selectedDate || app.today

  const activePatients = slot ? getPatientsForSlot(app.patients, slot.id, date) : []
  const count = activePatients.length
  const capacity = slot ? slot.capacity : 10
  const state = getSlotState(count, capacity)
  const badge = getSlotBadgeLabel(count, capacity)
  const percent = Math.min(100, Math.round((count / capacity) * 100))

  const closeDrawer = () => {
    try {
      app.setSelectedSlot(null)
    } catch (e) {
      console.error('Error in closeDrawer:', e)
    }
  }

  const openRegister = () => {
    try {
      if (slot && count >= capacity) {
        window.alert('This slot is already full. Please select another slot.')
        return
      }
      app.setSelectedSlot(slot.id)
      app.setRegisterOpen(true)
    } catch (e) {
      console.error('Error in openRegister:', e)
    }
  }

  const openPatient = (p) => {
    try {
      app.setInfoPatient(p)
    } catch (e) {
      console.error('Error in openPatient from drawer:', e)
    }
  }

  return (
    <>
      <div className={`drawer-backdrop ${open ? 'open' : ''}`} onClick={closeDrawer}></div>
      <div className={`slot-detail-drawer ${open ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="drawer-title-area">
            <h3 id="drawer-slot-time">{slot ? `${slot.time} (${formatDDMMYYYY(date)})` : ''}</h3>
            <span className="drawer-subtitle">Slot Details & Occupancy</span>
          </div>
          <button className="close-drawer-btn" onClick={closeDrawer} aria-label="Close details">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="drawer-body">
          <div className="drawer-capacity-card">
            <div className="capacity-desc">
              <span>Current Booking Ratio:</span>
              <strong>{count === capacity && count > 0 ? `FULL (${capacity}/${capacity})` : `${count}/${capacity}`}</strong>
            </div>
            <div className="capacity-progress-container">
              <div className="capacity-progress-bar" style={{ width: `${percent}%` }}></div>
            </div>
            <div className={`capacity-badge ${state}`}>{badge}</div>
          </div>

          <div className="drawer-section">
            <h4>Registered Patients for this hour</h4>
            <div className="scheduled-patients-list">
              {activePatients.length === 0 ? (
                <div className="drawer-no-patients">No patients scheduled in this hour on {formatDDMMYYYY(date)}.</div>
              ) : (
                activePatients.map((p) => {
                  const sexAbbr = p.gender === 'Male' ? 'M' : (p.gender === 'Female' ? 'F' : 'O')
                  return (
                    <div key={p.uin || p.id} className="drawer-patient-item clickable-patient-block" onClick={() => openPatient(p)} data-patient-id={p.uin || p.id} data-patient-name={p.name}>
                      <div className="patient-item-header">
                        <span className="patient-item-name">{p.name}</span>
                        <span className="patient-item-id">{p.uin || p.id}</span>
                      </div>
                      <div className="patient-item-details">
                        <span><strong>Age/Sex:</strong> {p.age} / {sexAbbr}</span>
                        <span><strong>Start Date:</strong> {p.startDate || formatDDMMYYYY(app.today)}</span>
                        <span><strong>End Date:</strong> {p.endDate || formatDDMMYYYY(app.today)}</span>
                        <span><strong>Vaidya:</strong> {getDoctorShortName(p.doctor)}</span>
                      </div>
                      {p.notes && <div className="patient-item-notes">&quot;{p.notes}&quot;</div>}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        <div className="drawer-footer">
          <button className="primary-action-btn w-full" onClick={openRegister}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>Add Patient to Slot</span>
          </button>
        </div>
      </div>
    </>
  )
}
