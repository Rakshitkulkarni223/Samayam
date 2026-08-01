export const SIMULATED_TODAY = new Date(2026, 6, 23)

export const SLOTS = [
  { id: 's1', time: '6:00 AM - 7:00 AM', capacity: 10 },
  { id: 's2', time: '7:00 AM - 8:00 AM', capacity: 10 },
  { id: 's3', time: '8:00 AM - 9:00 AM', capacity: 10 },
  { id: 's4', time: '9:00 AM - 10:00 AM', capacity: 10 },
  { id: 's5', time: '10:00 AM - 11:00 AM', capacity: 10 },
  { id: 's6', time: '11:00 AM - 12:00 PM', capacity: 10 },
  { id: 's7', time: '12:00 PM - 1:00 PM', capacity: 10 },
  { id: 's8', time: '1:00 PM - 2:00 PM', capacity: 10 },
  { id: 's9', time: '2:00 PM - 3:00 PM', capacity: 10 },
  { id: 's10', time: '3:00 PM - 4:00 PM', capacity: 10 },
  { id: 's11', time: '4:00 PM - 5:00 PM', capacity: 10 },
  { id: 's12', time: '5:00 PM - 6:00 PM', capacity: 10 },
  { id: 's13', time: '6:00 PM - 7:00 PM', capacity: 10 },
]

export const THERAPIES = [
  { key: 'vamana', label: 'Vamana', sanskrit: 'वमन', desc: 'Toxin elimination via upper tracts', room: 'Room 101', badgeClass: 'vamana-badge' },
  { key: 'virechana', label: 'Virechana', sanskrit: 'विरेचन', desc: 'Gastro-intestinal purification', room: 'Room 102 & 103', badgeClass: 'virechana-badge' },
  { key: 'basti', label: 'Basti', sanskrit: 'बस्ति', desc: 'Vata regulation & colon therapy', room: 'Room 104, 105', badgeClass: 'basti-badge' },
  { key: 'nasya', label: 'Nasya', sanskrit: 'नस्य', desc: 'Cleanse head region & channels', room: 'Room 106', badgeClass: 'nasya-badge' },
  { key: 'raktamokshana', label: 'Raktamokshana', sanskrit: 'रक्तमोक्षण', desc: 'Blood purification therapies', room: 'Room 107 (Prep)', badgeClass: 'raktamokshana-badge' },
]

export const DOCTORS = [
  'DR. ABDUL KHADER', 'DR. AMRITHA', 'DR. ANJALI', 'DR. ANUPAMA', 'DR. CHAITRA N', 'DR. CHETHANA',
  'DR. ELGEENA', 'DR. GOPAL T L', 'DR. HAMSAVENI', 'DR. HARSHITHA K S', 'DR. JAMBAVATHI', 'DR. JYOTI DEVANGAMATH',
  'DR. KIRAN KUMAR', 'DR. KIRAN M GOUD', 'DR. LOKESHWARI', 'DR. LOLASHRI', 'DR. MAHANTESH', 'DR. MANASA',
  'DR. MANGALA', 'DR. MANJUNATH ADIGA', 'DR. MEERA', 'DR. MIDHUN MOHAN', 'DR. NAYAN', 'DR. NEETHA',
  'DR. NEHARU', 'DR. NITHYASHREE', 'DR. PADMAVATHI', 'DR. PAPIYA JANA', 'DR. PRANESH', 'DR. PRASANNA',
  'DR. PRATIBHA', 'DR. PRIYANKA', 'DR. PUSHPA', 'DR. RADHIKA', 'DR. ROOPINI', 'DR. SHAILAJA S V',
  'DR. SHANTHALA', 'DR. SHASHIREKHA', 'DR. SHESHASHAYE B', 'DR. SHILPA', 'DR. SHREYAS', 'DR. SHRIDEVI',
  'DR. SHUBA V HEGDE', 'DR. SINDURA S (SINDURA A S)', 'DR. SOWMYA', 'DR. SREEKANTH', 'DR. SUJATHAMMA',
  'DR. SUMI SHAJI', 'DR. SUNAYANA', 'DR. SUNITHA G S', 'DR. SUPREETH M J', 'DR. USHA R', 'DR. VEENA',
  'DR. VEENA SHEKAR', 'DR. VENKATESH', 'DR. VIJAYALAKSHMI', 'DR. VINAY KUMAR K N', 'DR. VISHWANATH',
]

export function formatDDMMYYYY(dateObj) {
  try {
    if (!dateObj || isNaN(dateObj.getTime())) return ''
    const dd = String(dateObj.getDate()).padStart(2, '0')
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0')
    const yyyy = dateObj.getFullYear()
    return `${dd}/${mm}/${yyyy}`
  } catch (e) {
    console.error('Error in formatDDMMYYYY:', e)
    return ''
  }
}

export function parseAnyDate(val) {
  try {
    if (!val) return new Date(SIMULATED_TODAY)
    if (typeof val !== 'string') return new Date(val)
    if (val.includes('/')) {
      const parts = val.split('/')
      if (parts[0].length === 4) {
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
      }
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]))
    }
    if (val.includes('-')) {
      const parts = val.split('-')
      if (parts[0].length === 4) {
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
      }
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]))
    }
    return new Date(val)
  } catch (e) {
    console.error('Error in parseAnyDate:', e)
    return new Date(SIMULATED_TODAY)
  }
}

export function isDateInRange(targetDate, startDateStr, endDateStr) {
  try {
    if (!startDateStr) return true
    const sDate = parseAnyDate(startDateStr)
    const eDate = endDateStr ? parseAnyDate(endDateStr) : new Date(sDate.getTime() + 6 * 24 * 60 * 60 * 1000)

    const target = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()).getTime()
    const start = new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate()).getTime()
    const end = new Date(eDate.getFullYear(), eDate.getMonth(), eDate.getDate()).getTime()

    return target >= start && target <= end
  } catch (e) {
    console.error('Error in isDateInRange:', e)
    return false
  }
}

export function getPatientTherapies(patient) {
  try {
    const source = ((patient && (patient.therapy || patient.notes)) || '').toLowerCase()
    const therapies = []
    const keywords = ['vamana', 'virechana', 'basti', 'nasya', 'raktamokshana']
    keywords.forEach((kw) => {
      if (source.includes(kw)) therapies.push(kw)
    })
    if (therapies.length === 0 && source.includes('abhyanga')) therapies.push('abhyanga')
    if (therapies.length === 0 && source.includes('shirodhara')) therapies.push('shirodhara')
    return therapies
  } catch (e) {
    console.error('Error in getPatientTherapies:', e)
    return []
  }
}

export function getDoctorShortName(doctor) {
  try {
    if (!doctor) return '—'
    const parts = doctor.split(' ').filter(Boolean)
    return parts.slice(0, 2).join(' ')
  } catch (e) {
    console.error('Error in getDoctorShortName:', e)
    return doctor || '—'
  }
}

export function getInitials(name) {
  try {
    const parts = (name || 'Patient').trim().split(/\s+/)
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    return parts[0].substring(0, 2).toUpperCase()
  } catch (e) {
    console.error('Error in getInitials:', e)
    return 'PA'
  }
}

export function getSlotState(count, capacity) {
  try {
    if (count >= capacity) return 'state-full'
    if (count >= 6) return 'state-nearly-full'
    return 'state-available'
  } catch (e) {
    console.error('Error in getSlotState:', e)
    return 'state-available'
  }
}

export function getSlotBadgeLabel(count, capacity) {
  try {
    if (count >= capacity) return 'FULL'
    if (count >= 6) return 'NEARLY FULL'
    return 'AVAILABLE'
  } catch (e) {
    console.error('Error in getSlotBadgeLabel:', e)
    return 'AVAILABLE'
  }
}

export function normalizePatient(raw) {
  try {
    return {
      uin: raw.uin || raw.id || 'UIN-001',
      id: raw.id || raw.uin || 'UIN-001',
      name: raw.name || '',
      age: raw.age || '',
      gender: raw.gender || '',
      doctor: raw.doctor || '',
      slotId: raw.slotId || raw.slot_id || 's1',
      slotTime: raw.slotTime || raw.slot_time || '',
      startDate: raw.startDate || raw.start_date || formatDDMMYYYY(SIMULATED_TODAY),
      endDate: raw.endDate || raw.end_date || '',
      treatmentDays: raw.treatmentDays || raw.treatment_days || 7,
      notes: raw.notes || '',
      attendance: raw.attendance && typeof raw.attendance === 'object' ? raw.attendance : (raw.attendance ? JSON.parse(raw.attendance) : {}),
      therapy: raw.therapy || '',
    }
  } catch (e) {
    console.error('Error in normalizePatient:', e)
    return raw
  }
}

export function addDays(date, days) {
  try {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  } catch (e) {
    console.error('Error in addDays:', e)
    return new Date(date)
  }
}

export function getPatientsForSlot(patients, slotId, date) {
  try {
    return patients.filter((p) => p.slotId === slotId && isDateInRange(date, p.startDate, p.endDate))
  } catch (e) {
    console.error('Error in getPatientsForSlot:', e)
    return []
  }
}

export function calculateMetrics(patients, date) {
  try {
    const totalToday = patients.filter((p) => isDateInRange(date, p.startDate, p.endDate)).length
    const newRegistrations = patients.filter((p) => p.startDate === formatDDMMYYYY(date)).length
    const activeTreatments = totalToday
    const completedTreatments = patients.filter((p) => {
      const end = parseAnyDate(p.endDate)
      return end < date
    }).length

    let availableSlotsCount = 0
    let fullSlotsCount = 0
    SLOTS.forEach((slot) => {
      const count = getPatientsForSlot(patients, slot.id, date).length
      if (count >= slot.capacity) fullSlotsCount++
      else availableSlotsCount++
    })

    return {
      totalPatientsToday: totalToday,
      newRegistrations,
      activeTreatments,
      completedTreatments,
      availableSlots: availableSlotsCount,
      fullSlots: fullSlotsCount,
    }
  } catch (e) {
    console.error('Error in calculateMetrics:', e)
    return {
      totalPatientsToday: 0,
      newRegistrations: 0,
      activeTreatments: 0,
      completedTreatments: 0,
      availableSlots: 0,
      fullSlots: 0,
    }
  }
}
