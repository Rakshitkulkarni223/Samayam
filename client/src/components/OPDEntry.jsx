import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { formatDDMMYYYY, SIMULATED_TODAY, getPatientsForSlot, SLOTS } from '../utils.js'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function OPDEntry() {
  const app = useApp()

  const initialRows = useMemo(() => {
    try {
      const active = app.patients.filter((p) => {
        const slot = SLOTS.find((s) => s.id === p.slotId)
        if (!slot) return false
        return getPatientsForSlot(app.patients, p.slotId, SIMULATED_TODAY).some((x) => x.uin === p.uin || x.id === p.id)
      })
      return active.map((p, idx) => {
        const slot = SLOTS.find((s) => s.id === p.slotId)
        const times = slot ? slot.time.split(' - ') : ['8:00 AM', '9:00 AM']
        const sexAbbr = p.gender === 'Male' ? 'M' : (p.gender === 'Female' ? 'F' : 'O')
        return {
          slNo: idx + 1,
          opdNo: p.uin || p.id || '',
          billNo: `B-${p.uin || p.id || ''}`,
          name: p.name,
          ageSex: `${p.age}/${sexAbbr}`,
          procedure: p.therapy || 'General Panchakarma',
          day: 'Day 1',
          timeIn: times[0],
          timeOut: times[1],
          therapist: p.therapist || 'Therapist A',
          consultant: p.doctor ? p.doctor.split(' (')[0] : 'Dr. Prasad',
          remarks: p.notes ? p.notes.replace(/\n/g, ' ') : 'Standard Panchakarma Protocol',
        }
      })
    } catch (e) {
      console.error('Error in initialRows:', e)
      return []
    }
  }, [app.patients])

  const [rows, setRows] = useState(initialRows)

  const addRow = () => {
    try {
      setRows((prev) => [
        ...prev,
        {
          slNo: prev.length + 1,
          opdNo: '',
          billNo: '',
          name: '',
          ageSex: '',
          procedure: '',
          day: 'Day 1',
          timeIn: '',
          timeOut: '',
          therapist: '',
          consultant: '',
          remarks: '',
        },
      ])
    } catch (e) {
      console.error('Error in addRow:', e)
    }
  }

  const updateRow = (idx, field, value) => {
    try {
      setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)))
    } catch (e) {
      console.error('Error in updateRow:', e)
    }
  }

  const handlePrint = () => {
    try {
      window.print()
    } catch (e) {
      console.error('Error printing:', e)
    }
  }

  return (
    <div className="requisition-container">
      <div className="requisition-header">
        <div className="opd-title-group">
          <h2>OPD ENTRY FORM</h2>
          <div className="opd-date-block">
            <div className="opd-date-label">Date: <span>{formatDDMMYYYY(SIMULATED_TODAY)}</span></div>
            <div className="opd-day-label">Day: <span>{DAYS[SIMULATED_TODAY.getDay()]}</span></div>
          </div>
        </div>
        <div className="requisition-actions" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button type="button" className="primary-action-btn" id="add-opd-row-btn" style={{ padding: '8px 16px', fontSize: '0.82rem', fontWeight: 700 }} onClick={addRow}>+ Add Entry</button>
          <button type="button" className="secondary-action-btn" id="print-opd-btn" style={{ padding: '8px 16px', fontSize: '0.82rem', background: 'white', border: '1px solid var(--border-light)', cursor: 'pointer', borderRadius: 8, fontWeight: 700, color: 'var(--text-dark)' }} onClick={handlePrint}>
            Print Form
          </button>
        </div>
      </div>

      <div className="opd-table-wrapper">
        <table className="opd-entry-table" id="opd-entry-table">
          <thead>
            <tr>
              <th style={{ width: 55, textAlign: 'center' }}>SL.No</th>
              <th style={{ width: 95 }}>OPD No.</th>
              <th style={{ width: 95 }}>Bill No.</th>
              <th style={{ width: 190 }}>PATIENT NAME</th>
              <th style={{ width: 75, textAlign: 'center' }}>AGE/SEX</th>
              <th style={{ width: 140 }}>PROCEDURE</th>
              <th style={{ width: 65, textAlign: 'center' }}>DAY</th>
              <th style={{ width: 85, textAlign: 'center' }}>TIME IN</th>
              <th style={{ width: 85, textAlign: 'center' }}>TIME OUT</th>
              <th style={{ width: 130 }}>THERAPIST</th>
              <th style={{ width: 150 }}>CONSULTANT</th>
              <th style={{ width: 180 }}>REMARKS IF ANY</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan="12" style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No OPD entries logged for today. Click &quot;+ Add Entry&quot; or register a new patient to populate.
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ textAlign: 'center', fontWeight: 700 }}>{idx + 1}</td>
                  <td><input type="text" className="opd-input-cell" value={row.opdNo} onChange={(e) => updateRow(idx, 'opdNo', e.target.value)} /></td>
                  <td><input type="text" className="opd-input-cell" value={row.billNo} onChange={(e) => updateRow(idx, 'billNo', e.target.value)} /></td>
                  <td><input type="text" className="opd-input-cell" value={row.name} onChange={(e) => updateRow(idx, 'name', e.target.value)} /></td>
                  <td style={{ textAlign: 'center' }}><input type="text" className="opd-input-cell" style={{ textAlign: 'center' }} value={row.ageSex} onChange={(e) => updateRow(idx, 'ageSex', e.target.value)} /></td>
                  <td><input type="text" className="opd-input-cell" value={row.procedure} onChange={(e) => updateRow(idx, 'procedure', e.target.value)} /></td>
                  <td style={{ textAlign: 'center' }}><input type="text" className="opd-input-cell" style={{ textAlign: 'center' }} value={row.day} onChange={(e) => updateRow(idx, 'day', e.target.value)} /></td>
                  <td style={{ textAlign: 'center' }}><input type="text" className="opd-input-cell" style={{ textAlign: 'center' }} value={row.timeIn} onChange={(e) => updateRow(idx, 'timeIn', e.target.value)} /></td>
                  <td style={{ textAlign: 'center' }}><input type="text" className="opd-input-cell" style={{ textAlign: 'center' }} value={row.timeOut} onChange={(e) => updateRow(idx, 'timeOut', e.target.value)} /></td>
                  <td><input type="text" className="opd-input-cell" value={row.therapist} onChange={(e) => updateRow(idx, 'therapist', e.target.value)} /></td>
                  <td><input type="text" className="opd-input-cell" value={row.consultant} onChange={(e) => updateRow(idx, 'consultant', e.target.value)} /></td>
                  <td><input type="text" className="opd-input-cell" value={row.remarks} onChange={(e) => updateRow(idx, 'remarks', e.target.value)} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
