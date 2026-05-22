const express = require('express')
const router = express.Router()

// ─── XPR WALLET CONNECTION ───
router.post('/connect', async (req, res) => {
  const { accountName, publicKey } = req.body

  if (!accountName) {
    return res.status(400).json({ error: 'Account name required' })
  }

  res.json({
    message: 'Wallet connected',
    wallet: {
      accountName,
      publicKey: publicKey || null,
      chain: 'XPR Network',
      connectedAt: new Date().toISOString()
    }
  })
})

router.get('/balance/:account', async (req, res) => {
  const { account } = req.params

  // Mock balance — in production, query XPR Network blockchain
  res.json({
    account,
    balances: {
      XPR: 15420.50,
      GCSC: 5000.00,
      XUSDT: 250.00
    }
  })
})

router.post('/disconnect', (req, res) => {
  res.json({ message: 'Wallet disconnected' })
})

module.exports = router
