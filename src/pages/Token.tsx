import { useState } from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { Lock, TrendingUp, Vote, ArrowRight, ChevronUp } from 'lucide-react'

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }
const fadeUpChild = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } } }

function SectionLabel({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-2 font-inter font-semibold text-label uppercase tracking-label" style={{ color: '#00D4FF' }}>
      <span>&#9670;</span> {text}
    </span>
  )
}

/* ════════════════════════════════════════════
   PAGE — TOKEN
   ════════════════════════════════════════════ */
export default function Token() {
  const [stakeAmount, setStakeAmount] = useState(1000)
  const [stakeDuration, setStakeDuration] = useState(90)

  const apyRates: Record<number, number> = { 30: 8, 90: 12, 180: 16, 365: 22 }
  const apy = apyRates[stakeDuration] || 12
  const monthlyReward = (stakeAmount * apy / 100) / 12
  const totalAtMaturity = stakeAmount + (stakeAmount * apy / 100 * stakeDuration / 365)

  const priceData = [
    { month: 'Jan', price: 0.028 }, { month: 'Feb', price: 0.031 }, { month: 'Mar', price: 0.035 },
    { month: 'Apr', price: 0.032 }, { month: 'May', price: 0.038 }, { month: 'Jun', price: 0.0423 },
  ]
  const maxPrice = Math.max(...priceData.map(d => d.price))

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden" style={{ background: '#FFFFFF' }}>
        <div className="mx-auto max-w-container container-padding text-center" style={{ padding: '120px 0 80px' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUpChild}><SectionLabel text="GCSC ECOSYSTEM" /></motion.div>
            <motion.h1 variants={fadeUpChild} className="font-outfit font-bold text-hero leading-hero tracking-hero break-words mt-4 gradient-text">
              GCSC Token
            </motion.h1>
            <motion.p variants={fadeUpChild} className="font-inter text-body-lg mt-4 mx-auto" style={{ color: '#475569', maxWidth: '560px' }}>
              The native utility token powering the GCSC construction escrow ecosystem on XPR Network.
            </motion.p>
          </motion.div>

          {/* Price Display */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }} className="mt-10 inline-flex items-center gap-6 glass-card px-8 py-5">
            <div className="text-left">
              <p className="font-inter text-body-sm" style={{ color: '#94A3B8' }}>Current Price</p>
              <p className="font-outfit font-bold text-h2" style={{ color: '#0F172A' }}>$0.0423</p>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.12)' }}>
              <ChevronUp size={16} style={{ color: '#10B981' }} />
              <span className="font-inter font-medium text-sm" style={{ color: '#10B981' }}>+5.23%</span>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 max-w-[720px] mx-auto">
            {[
              { label: 'Market Cap', value: '$4.2M' },
              { label: 'Total Supply', value: '100M' },
              { label: 'Circulating', value: '45M' },
              { label: 'Staked', value: '12M' },
            ].map(stat => (
              <motion.div key={stat.label} variants={fadeUpChild} className="glass-card p-4 text-center">
                <p className="font-outfit font-bold text-h3" style={{ color: '#0F172A' }}>{stat.value}</p>
                <p className="font-inter text-body-sm" style={{ color: '#475569' }}>{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* TOKEN UTILITY */}
      <section style={{ background: '#F8FAFC', padding: '80px 0' }}>
        <div className="mx-auto max-w-container container-padding">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
            <SectionLabel text="TOKEN UTILITY" />
            <h2 className="font-outfit font-bold text-h2 break-words mt-3" style={{ color: '#0F172A' }}>Why Hold GCSC?</h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Lock, title: 'Stake for Collateral', desc: 'Lock your GCSC tokens as collateral to secure construction project loans. The more you stake, the higher your credit line.' },
              { icon: TrendingUp, title: 'Earn Rewards', desc: 'Earn passive income by staking GCSC tokens. Reward rates adjust based on network participation and duration.' },
              { icon: Vote, title: 'Governance', desc: 'Token holders vote on platform upgrades, fee structures, and ecosystem development decisions.' },
            ].map(card => (
              <motion.div key={card.title} variants={fadeUpChild} whileHover={{ y: -4 }} className="glass-card p-8 text-center transition-all duration-300">
                <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center rounded-2xl" style={{ background: 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 100%)' }}>
                  <card.icon size={28} className="text-white" />
                </div>
                <h3 className="font-outfit font-semibold text-h3" style={{ color: '#0F172A' }}>{card.title}</h3>
                <p className="font-inter text-body mt-2" style={{ color: '#475569' }}>{card.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* STAKING CALCULATOR */}
      <section style={{ background: '#FFFFFF', padding: '80px 0' }}>
        <div className="mx-auto max-w-container container-padding">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-10">
            <SectionLabel text="STAKING" />
            <h2 className="font-outfit font-bold text-h2 break-words mt-3" style={{ color: '#0F172A' }}>Staking Calculator</h2>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-[600px] mx-auto glass-card p-8">
            {/* Amount */}
            <label className="block font-inter font-medium text-body mb-2" style={{ color: '#0F172A' }}>GCSC Amount</label>
            <input
              type="number"
              value={stakeAmount}
              onChange={e => setStakeAmount(Math.max(0, Number(e.target.value)))}
              className="w-full px-4 py-3 rounded-xl border font-inter text-body focus:outline-none focus:ring-2"
              style={{ borderColor: 'rgba(123,47,247,0.3)', color: '#0F172A' }}
            />
            <div className="flex gap-2 mt-2">
              {[100, 1000, 10000].map(a => (
                <button key={a} onClick={() => setStakeAmount(a)} className="px-3 py-1 rounded-full font-inter text-sm border hover:bg-[rgba(123,47,247,0.08)] transition-colors" style={{ borderColor: 'rgba(123,47,247,0.3)', color: '#7B2FF7' }}>
                  +{a.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Duration */}
            <label className="block font-inter font-medium text-body mt-6 mb-2" style={{ color: '#0F172A' }}>Duration</label>
            <div className="grid grid-cols-4 gap-2">
              {[30, 90, 180, 365].map(d => (
                <button
                  key={d}
                  onClick={() => setStakeDuration(d)}
                  className="py-2 rounded-xl font-inter text-sm font-medium transition-all"
                  style={{
                    background: stakeDuration === d ? 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 100%)' : '#F1F5F9',
                    color: stakeDuration === d ? '#FFFFFF' : '#475569',
                  }}
                >
                  {d}d
                </button>
              ))}
            </div>

            {/* Results */}
            <div className="mt-6 p-4 rounded-xl" style={{ background: '#F8FAFC' }}>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="font-inter text-sm" style={{ color: '#94A3B8' }}>APY</p>
                  <p className="font-outfit font-bold text-h3" style={{ color: '#7B2FF7' }}>{apy}%</p>
                </div>
                <div>
                  <p className="font-inter text-sm" style={{ color: '#94A3B8' }}>Monthly</p>
                  <p className="font-outfit font-bold text-h3" style={{ color: '#0F172A' }}>${monthlyReward.toFixed(2)}</p>
                </div>
                <div>
                  <p className="font-inter text-sm" style={{ color: '#94A3B8' }}>At Maturity</p>
                  <p className="font-outfit font-bold text-h3" style={{ color: '#0F172A' }}>${totalAtMaturity.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PRICE CHART */}
      <section style={{ background: '#F8FAFC', padding: '80px 0' }}>
        <div className="mx-auto max-w-container container-padding">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-10">
            <SectionLabel text="PERFORMANCE" />
            <h2 className="font-outfit font-bold text-h2 break-words mt-3" style={{ color: '#0F172A' }}>Price History</h2>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="glass-card p-8 max-w-[720px] mx-auto">
            <div className="flex items-end gap-4 h-[200px]">
              {priceData.map((d, i) => (
                <div key={d.month} className="flex-1 flex flex-col items-center group">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity font-inter text-xs mb-1" style={{ color: '#475569' }}>${d.price.toFixed(4)}</div>
                  <motion.div
                    initial={{ height: 0 }}
                    whileInView={{ height: `${(d.price / maxPrice) * 160}px` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className="w-full rounded-t-lg"
                    style={{ background: 'linear-gradient(to top, #7B2FF7, #00D4FF)', minWidth: '40px' }}
                  />
                  <p className="font-inter text-sm mt-2" style={{ color: '#475569' }}>{d.month}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#FFFFFF', padding: '80px 0' }}>
        <div className="mx-auto max-w-container container-padding text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="gradient-card p-12 rounded-[24px]">
            <h2 className="font-outfit font-bold text-h2 text-white break-words">Ready to Invest in the Future?</h2>
            <p className="font-inter text-body-lg mt-3" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Join the GCSC ecosystem and earn rewards while transforming construction payments.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <Link to="/wallet" className="inline-flex items-center justify-center bg-white font-inter font-semibold text-[0.9375rem] px-8 py-[14px] rounded-full hover:scale-105 transition-all" style={{ color: '#7B2FF7' }}>
                Get GCSC Token <ArrowRight size={18} className="ml-2" />
              </Link>
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="inline-flex items-center justify-center bg-transparent text-white font-inter font-semibold text-[0.9375rem] px-8 py-[14px] rounded-full border border-white/40 hover:bg-white/10 transition-all">
                Try Calculator
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
