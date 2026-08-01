#!/usr/bin/env node
/**
 * SAMAYAM (समय) - Express + SQLite Hospital Backend
 * Serves both the REST API and the built React frontend.
 */

const express = require('express')
const cors = require('cors')
const Database = require('better-sqlite3')
const crypto = require('crypto')
const path = require('path')
const fs = require('fs')
const { execSync } = require('child_process')

const PORT = parseInt(process.env.PORT || '5000', 10)
const BASE_DIR = __dirname
const PROJECT_DIR = path.join(BASE_DIR, '..')
const DB_FILE = path.join(BASE_DIR, 'samayam_hospital.db')
const REACT_DIST = path.join(PROJECT_DIR, 'client', 'dist')

const app = express()
const SESSIONS = {} // in-memory token store

function ensureReactBuild() {
  try {
    const indexFile = path.join(REACT_DIST, 'index.html')
    if (fs.existsSync(indexFile)) {
      return true
    }

    const clientDir = path.join(PROJECT_DIR, 'client')
    if (!fs.existsSync(clientDir)) {
      console.warn('⚠️  client/ directory not found. Static frontend will not be available.')
      return false
    }

    console.log('🔨  React build not found. Building frontend...')
    execSync('npm run build', { cwd: clientDir, stdio: 'inherit' })
    console.log('✅ React frontend built successfully.')
    return true
  } catch (err) {
    console.error('[ERROR] ensureReactBuild:', err.message)
    return false
  }
}

const REACT_READY = ensureReactBuild()
const WEB_DIR = REACT_READY ? REACT_DIST : PROJECT_DIR

// Middleware
app.use(cors({ origin: true }))
app.use(express.json())

// Database helpers
function initDb() {
  try {
    const db = new Database(DB_FILE)
    db.exec(`
      CREATE TABLE IF NOT EXISTS patients (
        uin TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        age INTEGER,
        gender TEXT,
        doctor TEXT,
        slot_id TEXT,
        start_date TEXT,
        end_date TEXT,
        treatment_days INTEGER,
        notes TEXT,
        therapy TEXT,
        attendance TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    db.close()
    console.log(`✅ SQLite Database Initialized: ${DB_FILE}`)
  } catch (err) {
    console.error('[ERROR] initDb:', err.message)
    throw err
  }
}

function migrateDb() {
  try {
    const db = new Database(DB_FILE)
    const columns = db.prepare("PRAGMA table_info(patients)").all().map(r => r.name)
    if (!columns.includes('therapy')) {
      db.exec("ALTER TABLE patients ADD COLUMN therapy TEXT")
      console.log("⬆️  Added 'therapy' column to patients table")
    }
    db.close()
  } catch (err) {
    console.error('[ERROR] migrateDb:', err.message)
  }
}

function initAuthDb() {
  try {
    const db = new Database(DB_FILE)
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        username TEXT PRIMARY KEY,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    const count = db.prepare('SELECT COUNT(*) AS c FROM users').get().c
    if (count === 0) {
      const adminUser = process.env.SAMAYAM_ADMIN_USER || 'admin'
      const adminPass = process.env.SAMAYAM_ADMIN_PASS || 'admin123'
      createUser(adminUser, adminPass, 'admin')
      console.log(`🔐 Created default admin user: ${adminUser} / ${adminPass}`)
      console.log('   Set SAMAYAM_ADMIN_USER and SAMAYAM_ADMIN_PASS env vars to override.')
    }
    db.close()
  } catch (err) {
    console.error('[ERROR] initAuthDb:', err.message)
    throw err
  }
}

function hashPassword(password, salt) {
  try {
    return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256').toString('hex')
  } catch (err) {
    console.error('[ERROR] hashPassword:', err.message)
    throw err
  }
}

function createUser(username, password, role = 'admin') {
  try {
    const db = new Database(DB_FILE)
    const salt = crypto.randomBytes(16).toString('hex')
    const passwordHash = hashPassword(password, salt)
    const stmt = db.prepare(
      'INSERT OR REPLACE INTO users (username, password_hash, salt, role) VALUES (?, ?, ?, ?)'
    )
    stmt.run(username, passwordHash, salt, role)
    db.close()
  } catch (err) {
    console.error('[ERROR] createUser:', err.message)
    throw err
  }
}

function verifyUser(username, password) {
  try {
    const db = new Database(DB_FILE)
    const row = db.prepare('SELECT password_hash, salt FROM users WHERE username = ?').get(username)
    db.close()
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
    const patient = { ...row }
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

function fetchAllPatients() {
  try {
    const db = new Database(DB_FILE)
    const rows = db.prepare('SELECT * FROM patients ORDER BY created_at DESC').all()
    db.close()
    return rows.map(rowToPatient)
  } catch (err) {
    console.error('[ERROR] fetchAllPatients:', err.message)
    return []
  }
}

function savePatient(data) {
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

    const db = new Database(DB_FILE)
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO patients
      (uin, name, age, gender, doctor, slot_id, start_date, end_date, treatment_days, notes, therapy, attendance)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(uin, name, age, gender, doctor, slotId, startDate, endDate, treatmentDays, notes, therapy, attendance)
    db.close()
    return uin
  } catch (err) {
    console.error('[ERROR] savePatient:', err.message)
    throw err
  }
}

function updateAttendance(uin, attendance) {
  try {
    const db = new Database(DB_FILE)
    const stmt = db.prepare('UPDATE patients SET attendance = ? WHERE uin = ?')
    stmt.run(JSON.stringify(attendance || {}), uin)
    db.close()
    return true
  } catch (err) {
    console.error('[ERROR] updateAttendance:', err.message)
    throw err
  }
}

// Auth middleware
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

// API routes
app.post('/api/login', (req, res) => {
  try {
    const username = (req.body.username || '').trim()
    const password = req.body.password || ''
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' })
    }
    if (verifyUser(username, password)) {
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

app.get('/api/patients', requireAuth, (req, res) => {
  try {
    const patients = fetchAllPatients()
    res.json(patients)
  } catch (err) {
    console.error('[ERROR] /api/patients GET:', err.message)
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/patients/:id', requireAuth, (req, res) => {
  try {
    const db = new Database(DB_FILE)
    const row = db.prepare('SELECT * FROM patients WHERE uin = ?').get(req.params.id)
    db.close()
    if (!row) return res.status(404).json({ error: 'Patient not found' })
    res.json(rowToPatient(row))
  } catch (err) {
    console.error('[ERROR] /api/patients/:id:', err.message)
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/patients', requireAuth, (req, res) => {
  try {
    const uin = savePatient(req.body)
    console.log(`💾 Saved patient: ${req.body.name || ''} (${uin})`)
    res.json({ status: 'success', uin })
  } catch (err) {
    console.error('[ERROR] /api/patients POST:', err.message)
    res.status(500).json({ error: err.message })
  }
})

app.put('/api/patients/:id', requireAuth, (req, res) => {
  try {
    const data = { ...req.body, id: req.params.id }
    const uin = savePatient(data)
    res.json({ status: 'success', uin })
  } catch (err) {
    console.error('[ERROR] /api/patients PUT:', err.message)
    res.status(500).json({ error: err.message })
  }
})

app.delete('/api/patients/:id', requireAuth, (req, res) => {
  try {
    const db = new Database(DB_FILE)
    const result = db.prepare('DELETE FROM patients WHERE uin = ?').run(req.params.id)
    db.close()
    if (result.changes === 0) return res.status(404).json({ error: 'Patient not found' })
    res.json({ status: 'success' })
  } catch (err) {
    console.error('[ERROR] /api/patients DELETE:', err.message)
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/attendance', requireAuth, (req, res) => {
  try {
    const uin = req.body.uin || req.body.id
    if (!uin) return res.status(400).json({ error: 'uin is required' })
    updateAttendance(uin, req.body.attendance)
    res.json({ status: 'success' })
  } catch (err) {
    console.error('[ERROR] /api/attendance:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// Static React app
app.use(express.static(WEB_DIR))

// React Router fallback
app.get('*', (req, res) => {
  try {
    const indexFile = path.join(WEB_DIR, 'index.html')
    if (fs.existsSync(indexFile)) {
      res.sendFile(indexFile)
    } else {
      res.status(404).send('Frontend build not found. Run npm run build in the client/ folder.')
    }
  } catch (err) {
    console.error('[ERROR] fallback route:', err.message)
    res.status(500).send(err.message)
  }
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('[ERROR] Express error handler:', err.message)
  res.status(500).json({ error: err.message })
})

// Start server with port fallback
function startServer(port, maxAttempts = 10) {
  return new Promise((resolve, reject) => {
    let currentPort = port
    let attempts = 0

    function tryListen() {
      attempts++
      const server = app.listen(currentPort, () => {
        console.log('\n=======================================================')
        console.log('🏥 SAMAYAM Express Hospital Server Running!')
        console.log(`🌐 Access Dashboard at: http://localhost:${currentPort}`)
        console.log(`📁 Database Location:  ${DB_FILE}`)
        console.log(`📦 Serving frontend from: ${WEB_DIR}`)
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
    initDb()
    migrateDb()
    initAuthDb()
    const server = await startServer(PORT)
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down SAMAYAM server.')
      server.close(() => process.exit(0))
    })
  } catch (err) {
    console.error('[ERROR] main:', err.message)
    process.exit(1)
  }
}

main()
