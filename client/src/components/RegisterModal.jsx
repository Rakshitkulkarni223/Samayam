/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import {
  SLOTS,
  DOCTORS,
  SIMULATED_TODAY,
  formatDDMMYYYY,
  parseAnyDate,
  addDays,
  getPatientsForSlot,
  getPatientTherapies,
} from '../utils.js'

function computeEndDate(startVal, daysVal) {
  try {
    const base = parseAnyDate(startVal)
    const nd = parseInt(daysVal) || 7
    return formatDDMMYYYY(addDays(base, nd))
  } catch (e) {
    console.error('Error in computeEndDate:', e)
    return startVal
  }
}

function PopoverCalendar({ value, onSelect, onClose, inputRef }) {
  const [viewDate, setViewDate] = useState(parseAnyDate(value))

  useEffect(() => {
    try {
      setViewDate(parseAnyDate(value))
    } catch (e) {
      console.error('Error in PopoverCalendar useEffect:', e)
    }
  }, [value])

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const firstDay = new Date(year, month, 1).getDay()
  const totalDays = new Date(year, month + 1, 0).getDate()

  const select = (day) => {
    try {
      const selected = new Date(year, month, day)
      onSelect(formatDDMMYYYY(selected))
      onClose()
    } catch (e) {
      console.error('Error in select:', e)
    }
  }

  return (
    <div className="custom-date-popover open" ref={inputRef}>
      <div className="popover-header">
        <button type="button" onClick={() => { try { setViewDate(new Date(year, month - 1, 1)) } catch (e) { console.error('Error prev month:', e) } }}>&lt;</button>
        <span>{monthNames[month]} {year}</span>
        <button type="button" onClick={() => { try { setViewDate(new Date(year, month + 1, 1)) } catch (e) { console.error('Error next month:', e) } }}>&gt;</button>
      </div>
      <div className="popover-weekdays">
        <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
      </div>
      <div className="popover-days-grid">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`e-${i}`} className="popover-day-cell empty"></div>
        ))}
        {Array.from({ length: totalDays }).map((_, i) => {
          const day = i + 1
          const dateStr = formatDDMMYYYY(new Date(year, month, day))
          const isToday = day === 23 && month === 6 && year === 2026
          const isSelected = dateStr === value
          return (
            <div
              key={day}
              className={`popover-day-cell ${isSelected ? 'selected-date' : ''} ${isToday ? 'today-date' : ''}`}
              onClick={() => select(day)}
            >
              {day}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function RegisterModal() {
  const app = useApp()
  const modalRef = useRef(null)
  const [uin, setUin] = useState('')
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [doctorSearch, setDoctorSearch] = useState('')
  const [doctor, setDoctor] = useState('')
  const [doctorDropdownOpen, setDoctorDropdownOpen] = useState(false)
  const [startDate, setStartDate] = useState(formatDDMMYYYY(SIMULATED_TODAY))
  const [days, setDays] = useState(7)
  const [endDate, setEndDate] = useState(computeEndDate(formatDDMMYYYY(SIMULATED_TODAY), 7))
  const [slotId, setSlotId] = useState('s1')
  const [notes, setNotes] = useState('○ ')
  const [startPopoverOpen, setStartPopoverOpen] = useState(false)
  const [endPopoverOpen, setEndPopoverOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const startInputRef = useRef(null)
  const endInputRef = useRef(null)
  const doctorRef = useRef(null)

  useEffect(() => {
    try {
      setEndDate(computeEndDate(startDate, days))
    } catch (e) {
      console.error('Error in end date effect:', e)
    }
  }, [startDate, days])

  useEffect(() => {
    try {
      if (app.registerOpen) {
        const slot = app.selectedSlot || 's1'
        setSlotId(slot)
        const initialStart = formatDDMMYYYY(app.selectedDate || SIMULATED_TODAY)
        setStartDate(initialStart)
        setEndDate(computeEndDate(initialStart, days))
        if (!notes.trim()) setNotes('○ ')
      }
    } catch (e) {
      console.error('Error in register open effect:', e)
    }
  }, [app.registerOpen, app.selectedSlot, app.selectedDate])

  useEffect(() => {
    const handler = (e) => {
      try {
        if (startPopoverOpen && startInputRef.current && !startInputRef.current.contains(e.target)) setStartPopoverOpen(false)
        if (endPopoverOpen && endInputRef.current && !endInputRef.current.contains(e.target)) setEndPopoverOpen(false)
        if (doctorDropdownOpen && doctorRef.current && !doctorRef.current.contains(e.target)) setDoctorDropdownOpen(false)
      } catch (err) {
        console.error('Error in click outside handler:', err)
      }
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [startPopoverOpen, endPopoverOpen, doctorDropdownOpen])

  const filteredDoctors = useMemo(() => {
    try {
      if (!doctorSearch.trim()) return DOCTORS
      return DOCTORS.filter((d) => d.toLowerCase().includes(doctorSearch.toLowerCase()))
    } catch (e) {
      console.error('Error in filteredDoctors:', e)
      return []
    }
  }, [doctorSearch])

  const slotOptions = useMemo(() => {
    try {
      return SLOTS.map((slot) => {
        const count = getPatientsForSlot(app.patients, slot.id, parseAnyDate(startDate)).length
        const isFull = count >= slot.capacity
        return { ...slot, count, isFull }
      })
    } catch (e) {
      console.error('Error in slotOptions:', e)
      return SLOTS.map((s) => ({ ...s, count: 0, isFull: false }))
    }
  }, [app.patients, startDate])

  const handleDaysChange = (val) => {
    try {
      const n = parseInt(val)
      if (isNaN(n) || n < 1) {
        setDays('')
        return
      }
      setDays(n)
      setEndDate(computeEndDate(startDate, n))
    } catch (e) {
      console.error('Error in handleDaysChange:', e)
    }
  }

  const handleEndChange = (val) => {
    try {
      setEndDate(val)
      const s = parseAnyDate(startDate)
      const ed = parseAnyDate(val)
      const diff = Math.round((ed - s) / (1000 * 60 * 60 * 24))
      if (diff > 0) setDays(diff)
    } catch (e) {
      console.error('Error in handleEndChange:', e)
    }
  }

  const close = () => {
    try {
      app.setRegisterOpen(false)
      setUin('')
      setName('')
      setAge('')
      setGender('')
      setDoctorSearch('')
      setDoctor('')
      setDoctorDropdownOpen(false)
      const defaultStart = formatDDMMYYYY(SIMULATED_TODAY)
      setStartDate(defaultStart)
      setDays(7)
      setEndDate(computeEndDate(defaultStart, 7))
      setSlotId('s1')
      setNotes('○ ')
    } catch (e) {
      console.error('Error in close:', e)
    }
  }

  const submit = async (e) => {
    try {
      e.preventDefault()
      if (!name.trim() || !age || !gender || !doctor || !slotId || !startDate) {
        window.alert('Please fill all required fields.')
        return
      }
      const selectedOption = slotOptions.find((s) => s.id === slotId)
      if (selectedOption && selectedOption.isFull) {
        window.alert('Selected slot is full. Please choose another hour.')
        return
      }

      const detected = getPatientTherapies({ notes })
      const therapy = detected.length > 0 ? detected.join(', ') : 'General Panchakarma'

      const id = uin.trim().toUpperCase() || `OPD-${String(app.patients.length + 1).padStart(3, '0')}`

      setBusy(true)
      const ok = await app.addPatient({
        uin: id,
        id,
        name: name.trim(),
        age,
        gender,
        doctor,
        slotId,
        startDate,
        endDate,
        treatmentDays: days,
        notes,
        therapy,
        attendance: {},
      })
      if (ok) close()
      else window.alert('Failed to save patient')
    } catch (err) {
      console.error('Error in submit:', err)
      window.alert('Error saving patient')
    } finally {
      setBusy(false)
    }
  }

  const modal = app.registerOpen

  try {
    return (
      <div className={`modal-overlay ${modal ? 'open' : ''}`} onClick={(e) => { if (e.target === modalRef.current) close() }} ref={modalRef}>
        <div className="modal-card">
          <div className="modal-header">
            <div className="modal-title-container">
              <h3>Register & Allocate Slot</h3>
              <span className="modal-sanskrit-sub">नूतन रोगी पंजीकरण</span>
            </div>
            <button className="close-modal-btn" onClick={close} aria-label="Close modal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <form onSubmit={submit}>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-row-line1 col-span-2">
                  <div className="form-group uin-group">
                    <label>OPD NO <span className="required">*</span></label>
                    <input type="text" value={uin} onChange={(e) => setUin(e.target.value)} placeholder="OPD-001" style={{ textTransform: 'uppercase' }} />
                  </div>
                  <div className="form-group name-group">
                    <label>Patient Full Name <span className="required">*</span></label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                </div>

                <div className="form-row-line2 col-span-2">
                  <div className="form-group compact-age-group">
                    <label>Age <span className="required">*</span></label>
                    <input type="number" min="1" max="120" value={age} onChange={(e) => setAge(e.target.value)} required />
                  </div>
                  <div className="form-group compact-gender-group">
                    <label>Sex <span className="required">*</span></label>
                    <div className="gender-bubbles-wrapper">
                      {['Male', 'Female', 'Other'].map((g) => (
                        <label key={g} className="gender-bubble">
                          <input type="radio" name="gender" value={g} checked={gender === g} onChange={(e) => setGender(e.target.value)} required />
                          <span className="bubble-btn">{g[0]}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="form-group flex-doctor-group" style={{ position: 'relative' }} ref={doctorRef}>
                    <label>Consulting Vaidya (Doctor) <span className="required">*</span></label>
                    <div className="custom-searchable-select">
                      <input
                        type="text"
                        className="doctor-search-input"
                        value={doctorSearch}
                        placeholder="Search or select Vaidya..."
                        onChange={(e) => { setDoctorSearch(e.target.value); setDoctor(e.target.value); setDoctorDropdownOpen(true) }}
                        onFocus={() => setDoctorDropdownOpen(true)}
                        required
                      />
                      <span className="search-select-arrow">▼</span>
                      {doctorDropdownOpen && (
                        <div className="doctor-dropdown-menu open">
                          {filteredDoctors.length === 0 ? (
                            <div className="doctor-option-item no-match">No matching Vaidya found</div>
                          ) : (
                            filteredDoctors.map((d) => (
                              <div
                                key={d}
                                className={`doctor-option-item ${doctor === d ? 'selected' : ''}`}
                                onClick={() => { setDoctorSearch(d); setDoctor(d); setDoctorDropdownOpen(false) }}
                              >
                                {d}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-row-line3 col-span-2">
                  <div className="form-group flex-start-date-group" ref={startInputRef}>
                    <label>Start Date <span className="required">*</span></label>
                    <input
                      type="text"
                      value={startDate}
                      readOnly
                      onClick={() => { setStartPopoverOpen(true); setEndPopoverOpen(false) }}
                      onFocus={() => { setStartPopoverOpen(true); setEndPopoverOpen(false) }}
                      style={{ cursor: 'pointer' }}
                      required
                    />
                    {startPopoverOpen && (
                      <PopoverCalendar value={startDate} onSelect={(val) => { setStartDate(val); setEndDate(computeEndDate(val, days)) }} onClose={() => setStartPopoverOpen(false)} inputRef={startInputRef} />
                    )}
                  </div>
                  <div className="form-group compact-days-group">
                    <label>Days <span className="required">*</span></label>
                    <input type="number" min="1" max="365" value={days} onChange={(e) => handleDaysChange(e.target.value)} required />
                  </div>
                  <div className="form-group est-end-date-inline-group">
                    <label>Est. End Date</label>
                    <div className="estimated-end-date-note">{endDate}</div>
                  </div>
                </div>

                <div className="form-group end-date-picker-wrapper" ref={endInputRef}>
                  <label>End Date</label>
                  <input
                    type="text"
                    value={endDate}
                    readOnly
                    onClick={() => { setEndPopoverOpen(true); setStartPopoverOpen(false) }}
                    onFocus={() => { setEndPopoverOpen(true); setStartPopoverOpen(false) }}
                    style={{ cursor: 'pointer' }}
                  />
                  {endPopoverOpen && (
                    <PopoverCalendar value={endDate} onSelect={(val) => handleEndChange(val)} onClose={() => setEndPopoverOpen(false)} inputRef={endInputRef} />
                  )}
                </div>

                <div className="form-group">
                  <label>Preferred Hour Slot <span className="required">*</span></label>
                  <select value={slotId} onChange={(e) => setSlotId(e.target.value)} required>
                    {slotOptions.map((s) => (
                      <option key={s.id} value={s.id} disabled={s.isFull}>
                        {s.time} ({s.isFull ? 'FULL' : `${s.count}/${s.capacity}`})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group col-span-2">
                  <label>Treatment Plan</label>
                  <textarea id="reg-notes" rows="5" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="○ Type treatment plan step..."></textarea>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="secondary-btn" onClick={close}>Cancel</button>
              <button type="submit" className="primary-action-btn" disabled={busy}>
                {busy ? 'Saving...' : 'Confirm Slot Booking'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  } catch (e) {
    console.error('Error in RegisterModal render:', e)
    return null
  }
}
