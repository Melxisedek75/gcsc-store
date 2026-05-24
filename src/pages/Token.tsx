import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { Lock, TrendingUp, Vote, ArrowRight, ExternalLink, CheckCircle } from 'lucide-react'

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
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden" style={{ background: '#FFFFFF' }}>
        <div className="mx-auto max-w-container container-padding text-center" style={{ padding: '120px 0 80px' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUpChild}>
              <div className="inline-flex items-center gap-2 mb-4">
                <img src="/logos/xpr-network-logo.png" alt="XPR Network" className="w-5 h-5 object-contain" />
                <SectionLabel text="GCSC ECOSYSTEM" />
              </div>
            </motion.div>
            <motion.h1 variants={fadeUpChild} className="font-outfit font-bold text-hero leading-hero tracking-hero break-words mt-4 gradient-text">
              GCSC Token
            </motion.h1>
            <motion.p variants={fadeUpChild} className="font-inter text-body-lg mt-4 mx-auto" style={{ color: '#475569', maxWidth: '560px' }}>
              The native utility token powering the GCSC construction escrow ecosystem on XPR Network.
            </motion.p>
          </motion.div>

          {/* Coming Soon Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 inline-flex items-center gap-3 glass-card px-8 py-5"
          >
            <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
            <div className="text-left">
              <p className="font-inter text-body-sm" style={{ color: '#94A3B8' }}>Status</p>
              <p className="font-outfit font-bold text-h3" style={{ color: '#0F172A' }}>Coming Soon</p>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-6 font-inter text-body-sm"
            style={{ color: '#94A3B8' }}
          >
            Token launch date to be announced. Stay tuned for updates.
          </motion.p>
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

      {/* METAL PAY — BUY TOKENS */}
      <section style={{ background: '#FFFFFF', padding: '80px 0' }}>
        <div className="mx-auto max-w-container container-padding">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <SectionLabel text="GET GCSC TOKENS" />
              <h2 className="font-outfit font-bold text-h1 leading-h1 tracking-h1 mt-4" style={{ color: '#0F172A' }}>
                Buy with <span className="gradient-text">Metal Pay</span>
              </h2>
              <p className="font-inter text-body-lg mt-4" style={{ color: '#475569' }}>
                GCSC tokens will be available for purchase through Metal Pay — the compliant, 
                secure payment platform from Metallicus. Metal Pay offers the lowest card fees 
                in the industry with 24/7 live support and instant transfers on XPR Network.
              </p>

              <div className="space-y-4 mt-8">
                {[
                  'Lowest card fees in the industry',
                  'Instant transfers on XPR Network',
                  '24/7 live human support',
                  'Available in US, Australia & New Zealand',
                  'FDIC-insured cash wallets',
                ].map((item, i) => (
                  <motion.div
                    key={item}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#7B2FF7] to-[#3B6BF7] flex items-center justify-center flex-shrink-0">
                      <CheckCircle size={12} className="text-white" />
                    </div>
                    <span className="font-inter text-body" style={{ color: '#475569' }}>{item}</span>
                  </motion.div>
                ))}
              </div>

              <motion.a
                href="https://metalpay.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 mt-8 gradient-primary text-white font-inter font-semibold text-[0.9375rem] px-8 py-[14px] rounded-full hover:scale-[1.04] hover:shadow-glow active:scale-[0.98] transition-all duration-300"
                whileHover={{ scale: 1.05 }}
              >
                Visit Metal Pay <ExternalLink size={16} />
              </motion.a>
            </motion.div>

            {/* Right: Steps Card */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="glass-card rounded-[24px] p-8 lg:p-10 relative overflow-hidden">
                {/* Background glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                {/* Metal Pay Logo */}
                <div className="relative mb-8">
                  <img src="/logos/metalpay-logo.png" alt="Metal Pay" className="h-12 w-auto object-contain" />
                </div>

                {/* Steps */}
                <div className="space-y-6 relative">
                  {[
                    { step: '1', title: 'Download Metal Pay', desc: 'Get the app on iOS or Android and complete verification.' },
                    { step: '2', title: 'Fund Your Wallet', desc: 'Add funds via debit card, credit card, or bank transfer.' },
                    { step: '3', title: 'Purchase GCSC', desc: 'Buy GCSC tokens instantly with zero gas fees on XPR Network.' },
                  ].map((item, i) => (
                    <motion.div
                      key={item.step}
                      className="flex items-start gap-4"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7B2FF7] to-[#EC4899] flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                        {item.step}
                      </div>
                      <div>
                        <h4 className="font-outfit font-semibold text-body" style={{ color: '#0F172A' }}>{item.title}</h4>
                        <p className="font-inter text-body-sm mt-1" style={{ color: '#475569' }}>{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* CTA */}
                <motion.a
                  href="https://metalpay.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 flex items-center justify-center gap-2 w-full py-4 rounded-xl font-inter font-medium text-white transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #7B2FF7 0%, #EC4899 50%, #F59E0B 100%)',
                  }}
                  whileHover={{ scale: 1.02, boxShadow: '0 10px 40px rgba(236, 72, 153, 0.3)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  Get Metal Pay App <ArrowRight size={16} />
                </motion.a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#F8FAFC', padding: '80px 0' }}>
        <div className="mx-auto max-w-container container-padding text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="gradient-card p-12 rounded-[24px]">
            <h2 className="font-outfit font-bold text-h2 text-[#0F172A] break-words">Ready to Join the Ecosystem?</h2>
            <p className="font-inter text-body-lg mt-3" style={{ color: '#475569' }}>
              Be among the first to access GCSC tokens and transform construction payments.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <Link to="/wallet" className="inline-flex items-center justify-center gradient-primary text-white font-inter font-semibold text-[0.9375rem] px-8 py-[14px] rounded-full hover:scale-[1.04] hover:shadow-glow active:scale-[0.98] transition-all duration-300">
                Connect Wallet <ArrowRight size={18} className="ml-2" />
              </Link>
              <a
                href="https://xprnetwork.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-transparent font-inter font-semibold text-[0.9375rem] px-8 py-[14px] rounded-full border hover:bg-[rgba(123,47,247,0.08)] transition-all duration-300"
                style={{ borderColor: 'rgba(123,47,247,0.4)', color: '#0F172A' }}
              >
                <img src="/logos/xpr-network-logo.png" alt="XPR" className="w-4 h-4 mr-2 object-contain" />
                Learn About XPR
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
