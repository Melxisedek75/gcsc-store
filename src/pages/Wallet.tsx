import { useState } from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { Download, UserPlus, Link2, Coins, CreditCard, Check, ExternalLink, ArrowRight } from 'lucide-react'

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }
const fadeUpChild = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } } }

function SectionLabel({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-2 font-inter font-semibold text-label uppercase tracking-label gradient-text">
      <span>&#9670;</span> {text}
    </span>
  )
}

/* ════════════════════════════════════════════
   PAGE — WALLET SETUP
   ════════════════════════════════════════════ */
export default function Wallet() {
  const [metalConnected, setMetalConnected] = useState(false)

  const steps = [
    { icon: Download, num: '01', title: 'Download XPR Wallet', desc: 'Get the XPR Network wallet from the App Store or Google Play. Available for iOS and Android devices.', tags: ['iOS', 'Android'] },
    { icon: UserPlus, num: '02', title: 'Create Your Account', desc: 'Follow the in-app instructions to create a new XPR Network account. Your private keys are stored locally on your device — only you have access.', tags: ['Self-Custody', 'Secure'] },
    { icon: Link2, num: '03', title: 'Connect to GCSC', desc: 'Link your XPR wallet to the GCSC platform. Go to your Dashboard → Wallet and click "Connect XPR Wallet" to authorize.', tags: ['One-Click'] },
    { icon: Coins, num: '04', title: 'Get GCSC Tokens', desc: 'Purchase GCSC tokens through the integrated swap feature or receive them as payment for completed construction projects.', tags: ['Buy', 'Earn'] },
  ]

  const features = [
    { title: 'Instant USD Deposits', desc: 'Deposit USD directly from your bank account' },
    { title: 'Zero Fees', desc: 'No transaction fees on GCSC purchases' },
    { title: 'Bank Transfer Support', desc: 'ACH and wire transfer supported' },
    { title: 'Mobile First', desc: 'Manage everything from your phone' },
  ]

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden" style={{ background: '#FFFFFF' }}>
        <div className="mx-auto max-w-container container-padding text-center" style={{ padding: '120px 0 80px' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUpChild}><SectionLabel text="GETTING STARTED" /></motion.div>
            <motion.h1 variants={fadeUpChild} className="font-outfit font-bold brand-heading-hero shimmer-text break-words mt-4">
              Connect Your XPR Wallet
            </motion.h1>
            <motion.p variants={fadeUpChild} className="font-inter text-body-lg mt-4 mx-auto" style={{ color: '#475569', maxWidth: '560px' }}>
              Set up your XPR Network wallet to use GCSC tokens, smart contract escrow, and staking rewards.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* 4-STEP GUIDE */}
      <section style={{ background: '#F8FAFC', padding: '80px 0' }}>
        <div className="mx-auto max-w-container container-padding">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
            <SectionLabel text="SETUP GUIDE" />
            <h2 className="font-outfit font-bold text-h2 break-words mt-3 gradient-text">4 Easy Steps</h2>
          </motion.div>

          <div className="max-w-[720px] mx-auto space-y-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card p-6 flex items-start gap-5"
              >
                <div className="shrink-0 w-12 h-12 flex items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 100%)' }}>
                  <step.icon size={24} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-outfit font-bold text-sm" style={{ color: '#7B2FF7' }}>{step.num}</span>
                    <h3 className="font-outfit font-semibold text-h3 gradient-text">{step.title}</h3>
                  </div>
                  <p className="font-inter text-body-sm" style={{ color: '#475569' }}>{step.desc}</p>
                  <div className="flex gap-2 mt-2">
                    {step.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-full font-inter text-xs font-medium" style={{ background: 'rgba(123,47,247,0.08)', color: '#7B2FF7' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* METAL PAY */}
      <section style={{ background: '#FFFFFF', padding: '80px 0' }}>
        <div className="mx-auto max-w-container container-padding">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-10">
            <SectionLabel text="FIAT ON-RAMP" />
            <h2 className="font-outfit font-bold text-h2 break-words mt-3 gradient-text">Buy GCSC with Metal Pay</h2>
            <p className="font-inter text-body-lg mt-3 mx-auto" style={{ color: '#475569', maxWidth: '520px' }}>
              Use Metal Pay as your fiat on-ramp to purchase GCSC tokens directly with USD.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-[800px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Features */}
              <div className="space-y-3">
                {features.map(f => (
                  <div key={f.title} className="glass-card p-4 flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ background: 'rgba(16,185,129,0.12)' }}>
                      <Check size={16} style={{ color: '#10B981' }} />
                    </div>
                    <div>
                      <p className="font-inter font-medium text-sm gradient-text">{f.title}</p>
                      <p className="font-inter text-xs" style={{ color: '#475569' }}>{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Connect Card */}
              <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 flex items-center justify-center rounded-2xl mb-4" style={{ background: 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 100%)' }}>
                  <CreditCard size={32} className="text-white" />
                </div>
                <h3 className="font-outfit font-semibold text-h3 gradient-text">Metal Pay</h3>
                <p className="font-inter text-body-sm mt-1" style={{ color: '#475569' }}>Fiat-to-crypto on-ramp</p>
                <button
                  onClick={() => setMetalConnected(!metalConnected)}
                  className="mt-4 inline-flex items-center justify-center font-inter font-semibold text-sm px-6 py-3 rounded-full transition-all"
                  style={{
                    background: metalConnected ? 'rgba(16,185,129,0.12)' : 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 100%)',
                    color: metalConnected ? '#10B981' : '#FFFFFF',
                  }}
                >
                  {metalConnected ? <><Check size={16} className="mr-2" /> Connected</> : 'Connect Metal Pay'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* XPR NETWORK DETAILS */}
      <section style={{ background: '#F8FAFC', padding: '80px 0' }}>
        <div className="mx-auto max-w-container container-padding">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-10">
            <SectionLabel text="NETWORK" />
            <h2 className="font-outfit font-bold text-h2 break-words mt-3 gradient-text">XPR Network Details</h2>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-[560px] mx-auto">
            <div className="glass-card p-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(123,47,247,0.08)', border: '1px solid rgba(123,47,247,0.2)' }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: '#10B981' }} />
                  <span className="font-inter text-sm font-medium" style={{ color: '#7B2FF7' }}>Powered by XPR Network</span>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Network', value: 'XPR Network' },
                  { label: 'Chain ID', value: 'xpr' },
                  { label: 'Token Symbol', value: 'GCSC' },
                  { label: 'Contract', value: 'gscsmartct1' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                    <span className="font-inter text-sm" style={{ color: '#94A3B8' }}>{item.label}</span>
                    <span className="font-inter font-medium text-sm" style={{ color: '#0F172A' }}>{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <a href="https://xprnetwork.org" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-inter text-sm font-medium border hover:bg-[rgba(123,47,247,0.08)] transition-colors" style={{ borderColor: 'rgba(123,47,247,0.3)', color: '#7B2FF7' }}>
                  XPR Network <ExternalLink size={14} />
                </a>
                <a href="https://github.com/XPRNetwork" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-inter text-sm font-medium border hover:bg-[rgba(123,47,247,0.08)] transition-colors" style={{ borderColor: 'rgba(123,47,247,0.3)', color: '#7B2FF7' }}>
                  GitHub <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#FFFFFF', padding: '80px 0' }}>
        <div className="mx-auto max-w-container container-padding text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="gradient-card p-12 rounded-[24px]">
            <h2 className="font-outfit font-bold text-h2 text-white break-words">Start Building with Blockchain</h2>
            <p className="font-inter text-body-lg mt-3" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Connect your wallet and begin securing construction payments with smart contracts.
            </p>
            <Link to="/dashboard" className="inline-flex items-center justify-center bg-white font-inter font-semibold text-[0.9375rem] px-8 py-[14px] rounded-full hover:scale-105 transition-all mt-6" style={{ color: '#7B2FF7' }}>
              Go to Dashboard <ArrowRight size={18} className="ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
