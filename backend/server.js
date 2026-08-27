#!/usr/bin/env node
/**
 * SAMAYAM (समय) - Express + MongoDB Hospital Backend (API only)
 */

const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })

const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const crypto = require('crypto')

const PORT = parseInt(process.env.PORT || '5000', 10)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/samayam_hospital'

const app = express()
const SESSIONS = {}

app.use(cors({ origin: true }))
app.use(express.json())

// ---------------------------------------------------------------------------
// Mongoose models
// ---------------------------------------------------------------------------

const patientSchema = new mongoose.Schema(
  {
    uin: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: '' },
    age: { type: Number, default: 0 },
    gender: { type: String, default: '' },
    doctor: { type: String, default: '' },
    slot_id: { type: String, default: 's1' },
    start_date: { type: String, default: '' },
    end_date: { type: String, default: '' },
    treatment_days: { type: Number, default: 7 },
    notes: { type: String, default: '' },
    therapy: { type: String, default: '' },
    attendance: { type: String, default: '{}' },
  },
  { timestamps: true }
)

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, index: true },
    password_hash: { type: String, required: true },
    salt: { type: String, required: true },
    role: { type: String, default: 'admin' },
  },
  { timestamps: true }
)

const Patient = mongoose.model('Patient', patientSchema)
const User = mongoose.model('User', userSchema)

// ---------------------------------------------------------------------------
// Database connection & bootstrap
// ---------------------------------------------------------------------------

async function connectDb() {
  try {
    mongoose.set('strictQuery', true)
    await mongoose.connect(MONGODB_URI)
    console.log(`✅ MongoDB Connected: ${MONGODB_URI.replace(/\/\/([^:]+):[^@]+@/, '//$1:****@')}`)
  } catch (err) {
    console.error('[ERROR] connectDb:', err.message)
    throw err
  }
}

async function initAuthDb() {
  try {
    const adminUser = process.env.SAMAYAM_ADMIN_USER || 'admin'
    const adminPass = process.env.SAMAYAM_ADMIN_PASS || 'admin123'
    // Always sync the env-defined admin credentials on boot so that changing
    // SAMAYAM_ADMIN_PASS and restarting takes effect (the user is upserted).
    await createUser(adminUser, adminPass, 'admin')
    const count = await User.countDocuments()
    if (count === 1) {
      console.log(`🔐 Admin user ready: ${adminUser} / ${adminPass}`)
      console.log('   Set SAMAYAM_ADMIN_USER and SAMAYAM_ADMIN_PASS env vars to override.')
    }
  } catch (err) {
    console.error('[ERROR] initAuthDb:', err.message)
    throw err
  }
}

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------

function hashPassword(password, salt) {
  try {
    return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256').toString('hex')
  } catch (err) {
    console.error('[ERROR] hashPassword:', err.message)
    throw err
  }
}

async function createUser(username, password, role = 'admin') {
  try {
    const salt = crypto.randomBytes(16).toString('hex')
    const passwordHash = hashPassword(password, salt)
    await User.findOneAndUpdate(
      { username },
      { username, password_hash: passwordHash, salt, role },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
  } catch (err) {
    console.error('[ERROR] createUser:', err.message)
    throw err
  }
}

async function verifyUser(username, password) {
  try {
    const row = await User.findOne({ username }).lean()
    if (!row) return false
    const computed = hashPassword(password, row.salt)
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(row.password_hash))
  } catch (err) {
    console.error('[ERROR] verifyUser:', err.message)
    return false
  }
}

function createSession(username) {
  try {
    const token = crypto.randomBytes(32).toString('base64')
    SESSIONS[token] = username
    return token
  } catch (err) {
    console.error('[ERROR] createSession:', err.message)
    throw err
  }
}

function getSessionUser(token) {
  try {
    return SESSIONS[token] || null
  } catch (err) {
    console.error('[ERROR] getSessionUser:', err.message)
    return null
  }
}

function invalidateSession(token) {
  try {
    return delete SESSIONS[token]
  } catch (err) {
    console.error('[ERROR] invalidateSession:', err.message)
    return false
  }
}

// ---------------------------------------------------------------------------
// Domain helpers
// ---------------------------------------------------------------------------

function slotIdToTime(slotId) {
  try {
    const mapping = {
      s1: '6:00 AM - 7:00 AM',
      s2: '7:00 AM - 8:00 AM',
      s3: '8:00 AM - 9:00 AM',
      s4: '9:00 AM - 10:00 AM',
      s5: '10:00 AM - 11:00 AM',
      s6: '11:00 AM - 12:00 PM',
      s7: '12:00 PM - 1:00 PM',
      s8: '1:00 PM - 2:00 PM',
      s9: '2:00 PM - 3:00 PM',
      s10: '3:00 PM - 4:00 PM',
      s11: '4:00 PM - 5:00 PM',
      s12: '5:00 PM - 6:00 PM',
      s13: '6:00 PM - 7:00 PM',
    }
    return mapping[slotId] || ''
  } catch (err) {
    console.error('[ERROR] slotIdToTime:', err.message)
    return ''
  }
}

function extractTherapies(notes) {
  try {
    const text = (notes || '').toLowerCase()
    const therapies = []
    const keywords = ['vamana', 'virechana', 'basti', 'nasya', 'raktamokshana']
    for (const kw of keywords) {
      if (text.includes(kw)) therapies.push(kw.charAt(0).toUpperCase() + kw.slice(1))
    }
    if (therapies.length === 0 && text.includes('abhyanga')) therapies.push('Abhyanga')
    if (therapies.length === 0 && text.includes('shirodhara')) therapies.push('Shirodhara')
    return therapies
  } catch (err) {
    console.error('[ERROR] extractTherapies:', err.message)
    return []
  }
}

function rowToPatient(row) {
  try {
    const patient = row.toObject ? row.toObject() : { ...row }
    patient.id = patient.uin
    patient.slotId = patient.slot_id
    patient.slotTime = slotIdToTime(patient.slot_id)
    patient.startDate = patient.start_date
    patient.endDate = patient.end_date
    patient.treatmentDays = patient.treatment_days
    try {
      patient.attendance = JSON.parse(patient.attendance || '{}')
    } catch (e) {
      patient.attendance = {}
    }
    return patient
  } catch (err) {
    console.error('[ERROR] rowToPatient:', err.message)
    return row
  }
}

async function fetchAllPatients() {
  try {
    const rows = await Patient.find().sort({ createdAt: -1 }).lean()
    return rows.map(rowToPatient)
  } catch (err) {
    console.error('[ERROR] fetchAllPatients:', err.message)
    return []
  }
}

async function savePatient(data) {
  try {
    const uin = data.uin || data.id || 'UIN-001'
    const name = data.name || ''
    const age = parseInt(data.age || 0, 10) || 0
    const gender = data.gender || ''
    const doctor = data.doctor || ''
    const slotId = data.slotId || 's1'
    const startDate = data.startDate || ''
    const endDate = data.endDate || ''
    const treatmentDays = parseInt(data.treatmentDays || 7, 10) || 7
    const notes = data.notes || ''
    const attendance = JSON.stringify(data.attendance || {})
    let therapy = data.therapy || ''
    if (!therapy && notes) {
      therapy = extractTherapies(notes).join(', ')
    }

    await Patient.findOneAndUpdate(
      { uin },
      {
        uin,
        name,
        age,
        gender,
        doctor,
        slot_id: slotId,
        start_date: startDate,
        end_date: endDate,
        treatment_days: treatmentDays,
        notes,
        therapy,
        attendance,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
    return uin
  } catch (err) {
    console.error('[ERROR] savePatient:', err.message)
    throw err
  }
}

async function updateAttendance(uin, attendance) {
  try {
    await Patient.updateOne({ uin }, { attendance: JSON.stringify(attendance || {}) })
    return true
  } catch (err) {
    console.error('[ERROR] updateAttendance:', err.message)
    throw err
  }
}

// ---------------------------------------------------------------------------
// Auth middleware
// ---------------------------------------------------------------------------

function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ', 2)[1] : ''
    const user = getSessionUser(token)
    if (!user) {
      return res.status(401).json({ authenticated: false, error: 'Unauthorized' })
    }
    req.user = user
    next()
  } catch (err) {
    console.error('[ERROR] requireAuth:', err.message)
    res.status(500).json({ error: err.message })
  }
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

app.post('/api/login', async (req, res) => {
  try {
    const username = (req.body.username || '').trim()
    const password = req.body.password || ''
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' })
    }
    if (await verifyUser(username, password)) {
      const token = createSession(username)
      console.log(`🔓 Login successful: ${username}`)
      return res.json({ status: 'success', token, user: username })
    }
    res.status(401).json({ error: 'Invalid credentials' })
  } catch (err) {
    console.error('[ERROR] /api/login:', err.message)
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/logout', (req, res) => {
  try {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ', 2)[1] : ''
    if (token) invalidateSession(token)
    res.json({ status: 'success' })
  } catch (err) {
    console.error('[ERROR] /api/logout:', err.message)
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/session', (req, res) => {
  try {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ', 2)[1] : ''
    const user = getSessionUser(token)
    if (user) {
      res.json({ authenticated: true, user })
    } else {
      res.status(401).json({ authenticated: false })
    }
  } catch (err) {
    console.error('[ERROR] /api/session:', err.message)
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/patients', requireAuth, async (req, res) => {
  try {
    res.json(await fetchAllPatients())
  } catch (err) {
    console.error('[ERROR] /api/patients GET:', err.message)
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/patients/:id', requireAuth, async (req, res) => {
  try {
    const row = await Patient.findOne({ uin: req.params.id }).lean()
    if (!row) return res.status(404).json({ error: 'Patient not found' })
    res.json(rowToPatient(row))
  } catch (err) {
    console.error('[ERROR] /api/patients/:id:', err.message)
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/patients', requireAuth, async (req, res) => {
  try {
    const uin = await savePatient(req.body)
    console.log(`💾 Saved patient: ${req.body.name || ''} (${uin})`)
    res.json({ status: 'success', uin })
  } catch (err) {
    console.error('[ERROR] /api/patients POST:', err.message)
    res.status(500).json({ error: err.message })
  }
})

app.put('/api/patients/:id', requireAuth, async (req, res) => {
  try {
    const uin = await savePatient({ ...req.body, id: req.params.id })
    res.json({ status: 'success', uin })
  } catch (err) {
    console.error('[ERROR] /api/patients PUT:', err.message)
    res.status(500).json({ error: err.message })
  }
})

app.delete('/api/patients/:id', requireAuth, async (req, res) => {
  try {
    const result = await Patient.deleteOne({ uin: req.params.id })
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Patient not found' })
    res.json({ status: 'success' })
  } catch (err) {
    console.error('[ERROR] /api/patients DELETE:', err.message)
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/attendance', requireAuth, async (req, res) => {
  try {
    const uin = req.body.uin || req.body.id
    if (!uin) return res.status(400).json({ error: 'uin is required' })
    await updateAttendance(uin, req.body.attendance)
    res.json({ status: 'success' })
  } catch (err) {
    console.error('[ERROR] /api/attendance:', err.message)
    res.status(500).json({ error: err.message })
  }
})

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// API 404
app.use((req, res) => {
  try {
    res.status(404).json({ error: 'Not found' })
  } catch (err) {
    console.error('[ERROR] 404 handler:', err.message)
    res.status(500).send('Server error')
  }
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('[ERROR] Express error handler:', err.message)
  res.status(500).json({ error: err.message })
})

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------

function startServer(port, maxAttempts = 10) {
  return new Promise((resolve, reject) => {
    let currentPort = port
    let attempts = 0

    function tryListen() {
      attempts++
      const server = app.listen(currentPort, () => {
        console.log('\n=======================================================')
        console.log('🏥 SAMAYAM Express API Server Running!')
        console.log(`🌐 API Base URL: http://localhost:${currentPort}/api`)
        console.log('=======================================================\n')
        resolve(server)
      })

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE' && attempts < maxAttempts) {
          console.warn(`⚠️  Port ${currentPort} in use, trying next port...`)
          currentPort++
          tryListen()
        } else {
          reject(err)
        }
      })
    }

    tryListen()
  })
}

async function main() {
  try {
    await connectDb()
    await initAuthDb()
    const server = await startServer(PORT)
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down SAMAYAM server.')
      server.close(() => mongoose.disconnect().then(() => process.exit(0)))
    })
  } catch (err) {
    console.error('[ERROR] main:', err.message)
    process.exit(1)
  }
}

main()
