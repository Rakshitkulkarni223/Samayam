import { useApp } from '../context/AppContext.jsx'

export default function PatientsDirectory() {
  const app = useApp()

  const openPatient = (p) => {
    try {
      app.setInfoPatient(p)
    } catch (e) {
      console.error('Error in openPatient:', e)
    }
  }

  const backToDashboard = () => {
    try {
      app.setActiveTab('dashboard')
    } catch (e) {
      console.error('Error in backToDashboard:', e)
    }
  }

  try {
    if (app.patients.length === 0) {
      return (
        <div className="placeholder-view">
          <div className="placeholder-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
          </div>
          <h3>Patients Database</h3>
          <p>Manage electronic medical records, histories, treatment dates, and clinical logs.</p>
          <div className="patient-directory-list-mock" style={{ width: '100%', maxWidth: 800, marginBottom: 24 }}>
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.6)', borderRadius: 12, border: '1.5px dashed var(--border-light)' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--deep-green)', marginBottom: 6 }}>No Patients Registered Yet</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Click <strong>+ Quick Register</strong> to add patient records.</div>
            </div>
          </div>
          <button className="primary-action-btn back-to-dash-btn" onClick={backToDashboard}>
            Go to Daily Dashboard
          </button>
        </div>
      )
    }

    return (
      <div className="placeholder-view" style={{ alignItems: 'stretch', padding: 24 }}>
        <h3 style={{ alignSelf: 'center', marginBottom: 16 }}>Patients Directory</h3>
        <div className="patient-directory-list-mock" style={{ width: '100%', maxWidth: 1000, overflowX: 'auto' }}>
          <table className="opd-entry-table" style={{ minWidth: 800 }}>
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Name</th>
                <th>Age/Sex</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Allocated Hour</th>
                <th>Consultant Vaidya</th>
              </tr>
            </thead>
            <tbody>
              {app.patients.map((p, idx) => {
                const sexAbbr = p.gender === 'Male' ? 'M' : (p.gender === 'Female' ? 'F' : 'O')
                const slot = app.slots.find((s) => s.id === p.slotId)
                const time = slot ? `${slot.time.split(' ')[0]} ${slot.time.includes('AM') ? 'AM' : 'PM'}` : '—'
                return (
                  <tr
                    key={p.uin || p.id}
                    className="clickable-patient-block"
                    data-patient-id={p.uin || p.id}
                    data-patient-name={p.name}
                    onClick={() => openPatient(p)}
                    style={{ background: idx % 2 === 0 ? 'rgba(255,255,255,0.4)' : 'transparent' }}
                  >
                    <td style={{ fontWeight: 700, color: 'var(--gold)' }}>{p.uin || p.id}</td>
                    <td style={{ fontWeight: 600, color: 'var(--deep-green)' }}>{p.name}</td>
                    <td>{p.age} / {sexAbbr}</td>
                    <td>{p.startDate}</td>
                    <td>{p.endDate}</td>
                    <td>{time}</td>
                    <td>{p.doctor ? p.doctor.split(' (')[0] : '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  } catch (e) {
    console.error('Error in PatientsDirectory render:', e)
    return null
  }
}
