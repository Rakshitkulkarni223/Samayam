import { useEffect, useMemo, useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import {
  SLOTS,
  SIMULATED_TODAY,
  formatDDMMYYYY,
  getSlotState,
  getSlotBadgeLabel,
  getPatientsForSlot,
} from '../utils.js'

export default function Scheduler() {
  const app = useApp()
  const [activeMonth, setActiveMonth] = useState(SIMULATED_TODAY)
  const [selectedDate, setSelectedDate] = useState(SIMULATED_TODAY)

  useEffect(() => {
    try {
      setActiveMonth(app.selectedDate || SIMULATED_TODAY)
      setSelectedDate(app.selectedDate || SIMULATED_TODAY)
    } catch (e) {
      console.error('Error in Scheduler useEffect:', e)
    }
  }, [app.selectedDate])

  const year = activeMonth.getFullYear()
  const month = activeMonth.getMonth()
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayIndex = new Date(year, month, 1).getDay()

  const slotRows = useMemo(() => {
    try {
      return SLOTS.map((slot) => {
        const count = getPatientsForSlot(app.patients, slot.id, selectedDate).length
        return { ...slot, count }
      })
    } catch (e) {
      console.error('Error in slotRows:', e)
      return SLOTS.map((s) => ({ ...s, count: 0 }))
    }
  }, [app.patients, selectedDate])

  const handleDayClick = (day) => {
    try {
      const date = new Date(year, month, day)
      setSelectedDate(date)
      app.setSelectedDate(date)
    } catch (e) {
      console.error('Error in handleDayClick:', e)
    }
  }

  const handleRowClick = (slot) => {
    try {
      app.setSelectedDate(selectedDate)
      app.setSelectedSlot(slot.id)
    } catch (e) {
      console.error('Error in handleRowClick:', e)
    }
  }

  try {
    return (
      <div className="scheduler-layout">
        <div className="calendar-card">
          <div className="calendar-header">
            <button className="calendar-nav-btn" onClick={() => { try { setActiveMonth(new Date(year, month - 1, 1)) } catch (e) { console.error('Error prev month:', e) } }}>&larr;</button>
            <h3>{monthNames[month]} {year}</h3>
            <button className="calendar-nav-btn" onClick={() => { try { setActiveMonth(new Date(year, month + 1, 1)) } catch (e) { console.error('Error next month:', e) } }}>&rarr;</button>
          </div>
          <div className="calendar-weekdays">
            <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
          </div>
          <div className="calendar-days">
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`e-${i}`} className="calendar-day-cell empty"></div>
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const isToday = day === 23 && month === 6 && year === 2026
              const isSelected = day === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear()
              return (
                <div
                  key={day}
                  className={`calendar-day-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleDayClick(day)}
                >
                  {day}
                </div>
              )
            })}
          </div>
          <div className="calendar-footer-note">
            <span className="legend-dot status-today"></span> Today (23/07/2026)
            <span className="legend-dot status-sel" style={{ marginLeft: 14 }}></span> Selected Date
          </div>
        </div>

        <div className="scheduler-details-card">
          <div className="details-header-with-gold" style={{ borderBottom: '2px solid var(--border-gold)', paddingBottom: 8, marginBottom: 16 }}>
            <h3>Slots on {formatDDMMYYYY(selectedDate)}</h3>
          </div>

          <div className="scheduler-slots-header">
            <div>Time Slot</div>
            <div>Status</div>
            <div className="header-appts">Appointments</div>
            <div className="header-avail">Available</div>
          </div>

          <div className="scheduler-slots-single-list">
            {slotRows.map((slot) => {
              const state = getSlotState(slot.count, slot.capacity)
              const badge = getSlotBadgeLabel(slot.count, slot.capacity)
              const percent = Math.min(100, Math.round((slot.count / slot.capacity) * 100))
              const available = slot.capacity - slot.count
              return (
                <div key={slot.id} className={`scheduler-slot-row ${state}`} onClick={() => handleRowClick(slot)}>
                  <div className="slot-time-col">
                    <span className="slot-row-time">{slot.time}</span>
                    <div className="slot-row-progress-container thin-progress">
                      <div className="slot-row-progress-bar" style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                  <span className="slot-row-badge">{badge}</span>
                  <span className="slot-stat-appointments"><strong>{slot.count}</strong></span>
                  <span className="slot-stat-available"><strong>{available}</strong></span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  } catch (e) {
    console.error('Error in Scheduler render:', e)
    return null
  }
}
