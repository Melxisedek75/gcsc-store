require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3000

// ─── MIDDLEWARE ───
app.use(helmet())
app.use(cors({ origin: ['https://gcsc.store', 'http://localhost:5173'] }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
})
app.use('/api/', limiter)

// ─── AUTH MIDDLEWARE ───
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Access token required' })

  const jwt = require('jsonwebtoken')
  jwt.verify(token, process.env.JWT_SECRET || 'dev-secret', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' })
    req.user = user
    next()
  })
}

// ─── ROUTES ───
app.use('/api/auth', require('./routes/auth'))
app.use('/api/projects', require('./routes/projects'))
app.use('/api/bids', require('./routes/bids'))
app.use('/api/escrow', require('./routes/escrow'))
app.use('/api/wallet', require('./routes/wallet'))
app.use('/api/token', require('./routes/token'))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ─── SERVE FRONTEND (production) ───
app.use(express.static(path.join(__dirname, '../dist')))
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})

// ─── ERROR HANDLER ───
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

// ─── START ───
app.listen(PORT, () => {
  console.log(`[GCSC] API server running on port ${PORT}`)
})

module.exports = { app, authenticateToken }
