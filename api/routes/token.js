const express = require('express')
const router = express.Router()

// ─── GCSC TOKEN INFO ───
router.get('/info', (req, res) => {
  res.json({
    symbol: 'GCSC',
    name: 'GCSC Smart Contract Token',
    contract: 'gscsmartct1',
    decimals: 4,
    totalSupply: 100000000,
    circulatingSupply: 45000000,
    staked: 12000000,
    price: {
      usd: 0.0423,
      change24h: 5.23,
      change7d: 12.1
    },
    marketCap: 4240000
  })
})

router.get('/price-history', (req, res) => {
  const history = [
    { date: '2025-01-01', price: 0.028 }, { date: '2025-02-01', price: 0.031 },
    { date: '2025-03-01', price: 0.035 }, { date: '2025-04-01', price: 0.032 },
    { date: '2025-05-01', price: 0.038 }, { date: '2025-06-01', price: 0.0423 },
  ]
  res.json({ history })
})

router.post('/staking/calculate', (req, res) => {
  const { amount, duration } = req.body
  if (!amount || !duration) return res.status(400).json({ error: 'Missing amount or duration' })

  const apyRates = { 30: 8, 90: 12, 180: 16, 365: 22 }
  const apy = apyRates[duration] || 12

  res.json({
    amount,
    duration,
    apy,
    monthlyReward: (amount * apy / 100) / 12,
    totalAtMaturity: amount + (amount * apy / 100 * duration / 365)
  })
})

module.exports = router
