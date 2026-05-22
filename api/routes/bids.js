const express = require('express')
const router = express.Router()

let bids = [
  { id: 1, projectId: 1, contractorId: 201, amount: 22500, message: 'I can complete this in 4 weeks with premium materials.', status: 'submitted', createdAt: '2025-07-22T10:00:00Z' },
  { id: 2, projectId: 3, contractorId: 201, amount: 18500, message: 'Experienced with Colorado roofing. Licensed and insured.', status: 'under_review', createdAt: '2025-07-23T14:00:00Z' },
  { id: 3, projectId: 4, contractorId: 201, amount: 14200, message: 'Specialized in hardwood installation. 10+ years experience.', status: 'accepted', createdAt: '2025-07-24T09:00:00Z' },
]

router.get('/', (req, res) => {
  const { status } = req.query
  let result = [...bids]
  if (status) result = result.filter(b => b.status === status)
  res.json({ bids: result, total: result.length })
})

router.get('/contractor/:id', (req, res) => {
  const result = bids.filter(b => b.contractorId === parseInt(req.params.id))
  res.json({ bids: result, total: result.length })
})

router.post('/', (req, res) => {
  const { projectId, contractorId, amount, message } = req.body
  if (!projectId || !contractorId || !amount) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  const bid = {
    id: bids.length + 1, projectId, contractorId, amount, message: message || '', status: 'submitted', createdAt: new Date().toISOString()
  }
  bids.push(bid)
  res.status(201).json({ message: 'Bid submitted', bid })
})

router.patch('/:id/status', (req, res) => {
  const { status } = req.body
  const bid = bids.find(b => b.id === parseInt(req.params.id))
  if (!bid) return res.status(404).json({ error: 'Bid not found' })
  bid.status = status
  res.json({ message: 'Bid status updated', bid })
})

module.exports = router
