const express = require('express')
const router = express.Router()

// ─── ESCROW CONTRACT INTERFACE ───
// In production, this interacts with the XPR Network smart contract
let escrowContracts = []

router.post('/create', (req, res) => {
  const { projectId, homeownerId, contractorId, amount, milestones } = req.body
  if (!projectId || !homeownerId || !contractorId || !amount) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const escrow = {
    id: escrowContracts.length + 1,
    projectId,
    homeownerId,
    contractorId,
    amount,
    milestones: milestones || [
      { name: 'Deposit', percent: 25, status: 'pending', amount: amount * 0.25 },
      { name: 'Mid-Project', percent: 50, status: 'pending', amount: amount * 0.50 },
      { name: 'Completion', percent: 25, status: 'pending', amount: amount * 0.25 },
    ],
    status: 'created',
    createdAt: new Date().toISOString(),
    txHash: null
  }
  escrowContracts.push(escrow)

  res.status(201).json({
    message: 'Escrow contract created',
    escrow: {
      id: escrow.id,
      milestones: escrow.milestones,
      status: escrow.status
    }
  })
})

router.get('/:id', (req, res) => {
  const escrow = escrowContracts.find(e => e.id === parseInt(req.params.id))
  if (!escrow) return res.status(404).json({ error: 'Escrow not found' })
  res.json(escrow)
})

router.patch('/:id/milestone/:milestoneIndex/release', (req, res) => {
  const escrow = escrowContracts.find(e => e.id === parseInt(req.params.id))
  if (!escrow) return res.status(404).json({ error: 'Escrow not found' })

  const idx = parseInt(req.params.milestoneIndex)
  if (!escrow.milestones[idx]) return res.status(404).json({ error: 'Milestone not found' })

  escrow.milestones[idx].status = 'released'

  // Check if all milestones released
  const allReleased = escrow.milestones.every(m => m.status === 'released')
  if (allReleased) escrow.status = 'completed'

  res.json({ message: 'Milestone released', escrow })
})

module.exports = router
