/* eslint-disable react/prop-types */
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import {
  checkSession,
  loginUser,
  logoutUser,
  fetchPatients as apiFetchPatients,
  savePatient as apiSavePatient,
  updateAttendance as apiUpdateAttendance,
} from '../api.js'
import {
  SLOTS,
  SIMULATED_TODAY,
  formatDDMMYYYY,
  parseAnyDate,
  addDays,
  normalizePatient,
  getPatientsForSlot,
  getPatientTherapies,
  calculateMetrics,
} from '../utils.js'

const AppContext = createContext(null)

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const ctx = useContext(AppContext)
  try {
    return ctx
  } catch (e) {
    console.error('Error in useApp:', e)
    return null
  }
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [patients, setPatients] = useState([])
  const [activeTab, setActiveTab] = useState('dashboard')

  const [selectedSlot, setSelectedSlot] = useState(null)
  const [selectedDate, setSelectedDate] = useState(SIMULATED_TODAY)
  const [infoPatient, setInfoPatient] = useState(null)
  const [registerOpen, setRegisterOpen] = useState(false)

  const loadPatients = useCallback(async () => {
    try {
      const data = await apiFetchPatients()
      const normalized = (data || []).map(normalizePatient)
      setPatients(normalized)
      return normalized
    } catch (e) {
      console.error('Error in loadPatients:', e)
      return []
    }
  }, [])

  const verifySession = useCallback(async () => {
    try {
      const session = await checkSession()
      if (session && session.authenticated) {
        setUser(session.user || 'admin')
        await loadPatients()
      } else {
        setUser(null)
      }
    } catch (e) {
      console.error('Error in verifySession:', e)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [loadPatients])

  useEffect(() => {
    try {
      verifySession()
    } catch (e) {
      console.error('Error in useEffect verifySession:', e)
      setLoading(false)
    }
  }, [verifySession])

  const login = useCallback(async (username, password) => {
    try {
      const data = await loginUser(username, password)
      if (data && data.status === 'success' && data.token) {
        setUser(data.user || username)
        await loadPatients()
        return true
      }
      return false
    } catch (e) {
      console.error('Error in login:', e)
      return false
    }
  }, [loadPatients])

  const logout = useCallback(async () => {
    try {
      await logoutUser()
    } catch (e) {
      console.error('Error in logout:', e)
    } finally {
      setUser(null)
      setPatients([])
    }
  }, [])

  const addPatient = useCallback(async (patientData) => {
    try {
      const start = parseAnyDate(patientData.startDate)
      const days = parseInt(patientData.treatmentDays) || 7
      const end = addDays(start, days)
      const detected = getPatientTherapies({ notes: patientData.notes })
      const therapy = detected.length > 0 ? detected.join(', ') : 'General Panchakarma'

      const payload = {
        uin: patientData.uin || patientData.id,
        id: patientData.id || patientData.uin,
        name: patientData.name,
        age: patientData.age,
        gender: patientData.gender,
        doctor: patientData.doctor,
        slotId: patientData.slotId,
        startDate: patientData.startDate,
        endDate: formatDDMMYYYY(end),
        treatmentDays: days,
        notes: patientData.notes,
        attendance: patientData.attendance || {},
        therapy,
      }

      await apiSavePatient(payload)
      const list = await apiFetchPatients()
      const normalized = (list || []).map(normalizePatient)
      setPatients(normalized)
      return true
    } catch (e) {
      console.error('Error in addPatient:', e)
      return false
    }
  }, [])

  const saveAttendance = useCallback(async (uin, attendance) => {
    try {
      await apiUpdateAttendance(uin, attendance)
      setPatients((prev) =>
        prev.map((p) => (p.uin === uin || p.id === uin ? { ...p, attendance: { ...attendance } } : p))
      )
      return true
    } catch (e) {
      console.error('Error in saveAttendance:', e)
      return false
    }
  }, [])

  const refreshPatients = useCallback(async () => {
    try {
      const list = await apiFetchPatients()
      const normalized = (list || []).map(normalizePatient)
      setPatients(normalized)
    } catch (e) {
      console.error('Error in refreshPatients:', e)
    }
  }, [])

  const metrics = useMemo(() => calculateMetrics(patients, SIMULATED_TODAY), [patients])

  const value = useMemo(
    () => ({
      user,
      loading,
      patients,
      slots: SLOTS,
      today: SIMULATED_TODAY,
      activeTab,
      metrics,
      setActiveTab,
      login,
      logout,
      addPatient,
      saveAttendance,
      getPatientsForSlot: (slotId, date = SIMULATED_TODAY) => getPatientsForSlot(patients, slotId, date),
      refreshPatients,
      selectedSlot,
      setSelectedSlot,
      selectedDate,
      setSelectedDate,
      infoPatient,
      setInfoPatient,
      registerOpen,
      setRegisterOpen,
    }),
    [user, loading, patients, activeTab, metrics, login, logout, addPatient, saveAttendance, refreshPatients, selectedSlot, selectedDate, infoPatient, registerOpen]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
