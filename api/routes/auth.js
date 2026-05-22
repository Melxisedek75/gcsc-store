const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// ─── MOCK DB (replace with PostgreSQL in production) ───
const users = []

// ─── REGISTER ───
router.post('/register', async (req, res) => {
  const { email, password, role, fullName, companyName, licenseNumber, phone } = req.body

  if (!email || !password || !role || !fullName) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' })
  }

  const existingUser = users.find(u => u.email === email)
  if (existingUser) {
    return res.status(409).json({ error: 'Email already registered' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const user = {
    id: users.length + 1,
    email,
    password: hashedPassword,
    role, // 'contractor' or 'homeowner'
    fullName,
    companyName: companyName || null,
    licenseNumber: licenseNumber || null,
    phone: phone || null,
    walletAddress: null,
    createdAt: new Date().toISOString(),
    isVerified: false
  }
  users.push(user)

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '7d' }
  )

  res.status(201).json({
    message: 'Registration successful',
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      isVerified: user.isVerified
    }
  })
})

// ─── LOGIN ───
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' })
  }

  const user = users.find(u => u.email === email)
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const validPassword = await bcrypt.compare(password, user.password)
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '7d' }
  )

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      walletAddress: user.walletAddress,
      isVerified: user.isVerified
    }
  })
})

// ─── GET PROFILE ───
router.get('/profile', (req, res) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret')
    const user = users.find(u => u.id === decoded.userId)
    if (!user) return res.status(404).json({ error: 'User not found' })

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      companyName: user.companyName,
      licenseNumber: user.licenseNumber,
      phone: user.phone,
      walletAddress: user.walletAddress,
      createdAt: user.createdAt
    })
  } catch {
    res.status(403).json({ error: 'Invalid token' })
  }
})

module.exports = router
