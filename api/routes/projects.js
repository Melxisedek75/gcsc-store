const express = require('express')
const router = express.Router()

// ─── MOCK PROJECTS DATA ───
let projects = [
  { id: 1, homeownerId: 101, title: 'Kitchen Remodel', type: 'Kitchen', city: 'Miami, FL', state: 'FL', squareFootage: 250, budgetMin: 15000, budgetMax: 30000, description: 'Complete kitchen renovation with new cabinets, countertops, and appliances.', status: 'new', createdAt: '2025-07-20T10:00:00Z' },
  { id: 2, homeownerId: 102, title: 'Bathroom Renovation', type: 'Bathroom', city: 'Austin, TX', state: 'TX', squareFootage: 80, budgetMin: 8000, budgetMax: 15000, description: 'Full bathroom gut and remodel with walk-in shower.', status: 'new', createdAt: '2025-07-21T14:30:00Z' },
  { id: 3, homeownerId: 103, title: 'Roof Replacement', type: 'Roofing', city: 'Denver, CO', state: 'CO', squareFootage: 2200, budgetMin: 12000, budgetMax: 25000, description: 'Replace asphalt shingle roof on single-family home.', status: 'pending', createdAt: '2025-07-22T09:15:00Z' },
  { id: 4, homeownerId: 104, title: 'Hardwood Flooring', type: 'Flooring', city: 'Seattle, WA', state: 'WA', squareFootage: 1500, budgetMin: 10000, budgetMax: 18000, description: 'Install hardwood flooring throughout main living areas.', status: 'new', createdAt: '2025-07-23T11:00:00Z' },
  { id: 5, homeownerId: 105, title: 'Electrical Panel Upgrade', type: 'Electrical', city: 'Phoenix, AZ', state: 'AZ', squareFootage: 0, budgetMin: 2500, budgetMax: 5000, description: 'Upgrade 100A to 200A electrical panel with full home rewiring assessment.', status: 'pending', createdAt: '2025-07-23T16:45:00Z' },
  { id: 6, homeownerId: 106, title: 'Full Home Renovation', type: 'Full Renovation', city: 'Atlanta, GA', state: 'GA', squareFootage: 3200, budgetMin: 80000, budgetMax: 150000, description: 'Complete renovation of 4-bedroom home including kitchen, bathrooms, and living areas.', status: 'new', createdAt: '2025-07-24T08:00:00Z' },
]

// ─── GET ALL PROJECTS ───
router.get('/', (req, res) => {
  const { status, type, city } = req.query
  let result = [...projects]

  if (status) result = result.filter(p => p.status === status)
  if (type) result = result.filter(p => p.type === type)
  if (city) result = result.filter(p => p.city.toLowerCase().includes(city.toLowerCase()))

  res.json({ projects: result, total: result.length })
})

// ─── GET PROJECT BY ID ───
router.get('/:id', (req, res) => {
  const project = projects.find(p => p.id === parseInt(req.params.id))
  if (!project) return res.status(404).json({ error: 'Project not found' })
  res.json(project)
})

// ─── CREATE PROJECT (homeowner) ───
router.post('/', (req, res) => {
  const { title, type, city, state, squareFootage, budgetMin, budgetMax, description } = req.body

  if (!title || !type || !city || !budgetMin || !budgetMax) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const project = {
    id: projects.length + 1,
    homeownerId: req.body.homeownerId || 999,
    title,
    type,
    city,
    state: state || '',
    squareFootage: squareFootage || 0,
    budgetMin,
    budgetMax,
    description: description || '',
    status: 'new',
    createdAt: new Date().toISOString()
  }
  projects.push(project)

  res.status(201).json({ message: 'Project created', project })
})

// ─── UPDATE PROJECT STATUS ───
router.patch('/:id/status', (req, res) => {
  const { status } = req.body
  const project = projects.find(p => p.id === parseInt(req.params.id))
  if (!project) return res.status(404).json({ error: 'Project not found' })

  project.status = status
  res.json({ message: 'Status updated', project })
})

module.exports = router
