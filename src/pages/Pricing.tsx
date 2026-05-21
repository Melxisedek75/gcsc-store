import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, ChevronDown } from 'lucide-react'

/* ─── animation helpers ─── */

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const staggerChild = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
}

/* ─── data: homeowner tiers ─── */
const homeownerTiers = [
  {
    name: 'Starter',
    price: 'Free',
    priceNote: '',
    subtitle: 'For small projects',
    popular: false,
    features: [
      { label: '1 active project', included: true },
      { label: 'Escrow Protection', included: true },
      { label: '3 milestones', included: true },
      { label: 'Basic Contractor Verification', included: true },
      { label: 'Standard Dispute (72h)', included: true },
      { label: 'Email Support', included: true },
      { label: 'Custom Contracts', included: false },
      { label: 'API Access', included: false },
      { label: 'White-label Option', included: false },
    ],
    cta: 'Get Started Free',
    ctaLink: '/contact',
  },
  {
    name: 'Pro',
    price: '2.5%',
    priceNote: 'per transaction',
    subtitle: 'For active renovators',
    popular: true,
    features: [
      { label: 'Unlimited projects', included: true },
      { label: 'Escrow Protection', included: true },
      { label: 'Unlimited milestones', included: true },
      { label: 'Enhanced Contractor Verification', included: true },
      { label: 'Priority Dispute (24h)', included: true },
      { label: 'Priority Email + Chat', included: true },
      { label: 'Custom Contracts', included: true },
      { label: 'API Access', included: false },
      { label: 'White-label Option', included: false },
    ],
    cta: 'Choose Pro',
    ctaLink: '/contact',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    priceNote: '',
    subtitle: 'For developers & builders',
    popular: false,
    features: [
      { label: 'Unlimited projects', included: true },
      { label: 'Escrow Protection', included: true },
      { label: 'Unlimited milestones', included: true },
      { label: 'Premium + On-site Verification', included: true },
      { label: 'Dedicated Dispute Manager', included: true },
      { label: 'Dedicated Phone Support', included: true },
      { label: 'Custom Contracts', included: true },
      { label: 'API Access', included: true },
      { label: 'White-label Option', included: true },
    ],
    cta: 'Contact Sales',
    ctaLink: '/contact',
  },
]

/* ─── data: contractor tiers ─── */
const contractorTiers = [
  {
    name: 'Starter',
    price: 'Free',
    priceNote: '',
    subtitle: 'For occasional jobs',
    popular: false,
    features: [
      { label: '3 bids/month', included: true },
      { label: 'Escrow Protection', included: true },
      { label: 'Basic GCSC Badge', included: true },
      { label: 'Standard Lead Priority', included: true },
      { label: 'Basic Portfolio', included: true },
      { label: 'Basic Analytics', included: true },
      { label: 'Standard Dispute Protection', included: true },
      { label: 'API Access', included: false },
      { label: 'Team Management', included: false },
    ],
    cta: 'Get Started Free',
    ctaLink: '/contact',
  },
  {
    name: 'Pro',
    price: '1.5%',
    priceNote: 'per transaction',
    subtitle: 'For full-time pros',
    popular: true,
    features: [
      { label: 'Unlimited bids', included: true },
      { label: 'Escrow Protection', included: true },
      { label: 'Verified Pro Badge', included: true },
      { label: 'Boosted Lead Priority', included: true },
      { label: 'Enhanced Portfolio + Media', included: true },
      { label: 'Advanced Analytics + Reports', included: true },
      { label: 'Priority Dispute Protection', included: true },
      { label: 'API Access', included: false },
      { label: 'Team Management (up to 5)', included: true },
    ],
    cta: 'Choose Pro',
    ctaLink: '/contact',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    priceNote: '',
    subtitle: 'For firms & crews',
    popular: false,
    features: [
      { label: 'Unlimited bids', included: true },
      { label: 'Escrow Protection', included: true },
      { label: 'Premium Partner Badge', included: true },
      { label: 'Exclusive Lead Priority', included: true },
      { label: 'Custom Branded Portfolio', included: true },
      { label: 'Custom Reports', included: true },
      { label: 'Dedicated Dispute Manager', included: true },
      { label: 'API Access', included: true },
      { label: 'Unlimited Team Members', included: true },
    ],
    cta: 'Contact Sales',
    ctaLink: '/contact',
  },
]

/* ─── data: comparison table (homeowner view) ─── */
const comparisonCategories = [
  {
    name: 'Core Protection',
    rows: [
      { feature: 'Escrow Protection', starter: true, pro: true, enterprise: true },
      { feature: 'Dispute Resolution', starter: 'Standard (72h)', pro: 'Priority (24h)', enterprise: 'Dedicated Manager' },
      { feature: 'Contractor Verification', starter: 'Basic', pro: 'Enhanced', enterprise: 'Premium + On-site' },
    ],
  },
  {
    name: 'Project Management',
    rows: [
      { feature: 'Active Projects', starter: '1', pro: 'Unlimited', enterprise: 'Unlimited' },
      { feature: 'Milestones', starter: '3', pro: 'Unlimited', enterprise: 'Unlimited' },
      { feature: 'Custom Contracts', starter: false, pro: true, enterprise: true },
    ],
  },
  {
    name: 'Support',
    rows: [
      { feature: 'Customer Support', starter: 'Email', pro: 'Priority Email + Chat', enterprise: 'Dedicated Phone' },
      { feature: 'Dispute Manager', starter: false, pro: false, enterprise: true },
    ],
  },
  {
    name: 'Advanced',
    rows: [
      { feature: 'API Access', starter: false, pro: false, enterprise: true },
      { feature: 'White-label Option', starter: false, pro: false, enterprise: true },
      { feature: 'Custom Reporting', starter: false, pro: false, enterprise: true },
    ],
  },
]

/* ─── data: FAQ ─── */
const faqItems = [
  {
    q: 'Are there any hidden fees?',
    a: 'Absolutely not. The percentage fee you see is the only fee GCSC charges. There are no setup fees, monthly fees, withdrawal fees, or cancellation fees. Blockchain transaction fees on XPR Network are covered by GCSC.',
  },
  {
    q: 'When am I charged?',
    a: 'Homeowners are charged when funds are deposited into escrow. Contractors are charged when payment is released from escrow. You only pay when money actually moves through the platform.',
  },
  {
    q: 'Can I switch plans?',
    a: 'Yes, you can upgrade or downgrade your plan at any time. When upgrading, new features are available immediately. When downgrading, changes take effect at the start of your next billing cycle.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'GCSC accepts all major credit and debit cards, bank transfers (ACH), and XPR cryptocurrency deposits. Enterprise clients can arrange invoicing.',
  },
  {
    q: 'Is there a refund policy?',
    a: 'Yes. If a project is cancelled before work begins, escrow deposits are refunded in full minus any blockchain transaction costs. Once work has commenced, refunds are handled through our dispute resolution process.',
  },
  {
    q: 'Do you offer discounts for nonprofits or large volume?',
    a: 'Yes. We offer special pricing for nonprofit organizations, government contracts, and clients processing over $500K annually. Contact our sales team for a custom quote.',
  },
]

/* ─── FAQ Accordion Item ─── */
function FaqItem({ question, answer, isOpen, onClick }: { question: string; answer: string; isOpen: boolean; onClick: () => void }) {
  return (
    <div className="border-b" style={{ borderColor: 'rgba(11,14,23,0.08)' }}>
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="font-outfit font-semibold text-h4 text-void pr-4">{question}</span>
        <ChevronDown
          size={20}
          className="shrink-0 text-void transition-transform duration-300"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="overflow-hidden"
          >
            <p className="font-inter text-body text-silver pb-5 leading-body">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Scroll-reveal wrapper ─── */
function ScrollReveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.15 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
    >
      {children}
    </motion.div>
  )
}

/* ═══════════════════════════════════════════ */
/* ═══ MAIN PRICING PAGE ═════════════════════ */
/* ═══════════════════════════════════════════ */
export default function Pricing() {
  const [userType, setUserType] = useState<'homeowner' | 'contractor'>('homeowner')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const tiers = userType === 'homeowner' ? homeownerTiers : contractorTiers

  return (
    <div className="w-full">
      {/* ═══════ SECTION 1: HERO ═══════ */}
      <section
        className="relative w-full flex items-center justify-center overflow-hidden"
        style={{
          minHeight: '50vh',
          background: `
            radial-gradient(ellipse 80% 60% at 20% 40%, rgba(123, 47, 247, 0.35) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 70% 60%, rgba(59, 107, 247, 0.3) 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 50% 90%, rgba(0, 212, 255, 0.25) 0%, transparent 50%),
            #0B0E17
          `,
        }}
      >
        <div className="relative z-10 mx-auto max-w-container container-padding text-center py-32">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Eyebrow */}
            <motion.div variants={staggerChild} className="flex items-center justify-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-electric" />
              <span className="font-outfit font-semibold text-label text-electric uppercase tracking-[0.12em]">
                Transparent Pricing
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={staggerChild}
              className="font-outfit font-bold text-h1 text-white mb-4"
            >
              Simple, Fair Pricing
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={staggerChild}
              className="font-inter text-body-lg text-silver max-w-[640px] mx-auto"
            >
              No hidden fees. No monthly subscriptions. Pay only when you use GCSC to secure a construction project.
            </motion.p>

            {/* Toggle */}
            <motion.div variants={staggerChild} className="mt-8 flex items-center justify-center">
              <div
                className="relative inline-flex items-center rounded-full p-1"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <motion.div
                  className="absolute top-1 bottom-1 rounded-full bg-violet"
                  layoutId="pricingToggle"
                  style={{ borderRadius: 9999 }}
                  initial={false}
                  animate={{
                    left: userType === 'homeowner' ? 4 : '50%',
                    right: userType === 'homeowner' ? '50%' : 4,
                    width: 'calc(50% - 4px)',
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
                <button
                  onClick={() => setUserType('homeowner')}
                  className="relative z-10 px-6 py-2.5 font-inter font-medium text-[0.875rem] rounded-full transition-colors duration-200"
                  style={{ color: userType === 'homeowner' ? '#fff' : 'var(--silver)' }}
                >
                  Homeowner
                </button>
                <button
                  onClick={() => setUserType('contractor')}
                  className="relative z-10 px-6 py-2.5 font-inter font-medium text-[0.875rem] rounded-full transition-colors duration-200"
                  style={{ color: userType === 'contractor' ? '#fff' : 'var(--silver)' }}
                >
                  Contractor
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════ SECTION 2: PRICING CARDS ═══════ */}
      <section className="w-full bg-surface" style={{ marginTop: '-40px', padding: '120px 0 80px' }}>
        <div className="mx-auto max-w-[1100px] container-padding">
          <AnimatePresence mode="wait">
            <motion.div
              key={userType}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start"
            >
              {tiers.map((tier, i) => (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.15,
                    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                  }}
                  className="relative"
                  style={{ zIndex: tier.popular ? 2 : 1 }}
                >
                  {/* Popular badge */}
                  {tier.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                      <span className="gradient-primary text-white font-outfit font-semibold text-[0.75rem] px-4 py-1.5 rounded-full whitespace-nowrap">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div
                    className="relative rounded-[20px] bg-white transition-all duration-400"
                    style={{
                      padding: '40px 32px',
                      boxShadow: tier.popular
                        ? '0 4px 24px rgba(11,14,23,0.1)'
                        : '0 4px 24px rgba(11,14,23,0.06)',
                      border: tier.popular
                        ? '2px solid transparent'
                        : '1px solid rgba(11,14,23,0.08)',
                      transform: tier.popular ? 'scale(1.03)' : 'scale(1)',
                      backgroundOrigin: tier.popular ? 'border-box' : undefined,
                      transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    {/* Gradient border for popular card */}
                    {tier.popular && (
                      <div
                        className="absolute inset-0 rounded-[20px] pointer-events-none"
                        style={{
                          padding: '2px',
                          background: 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 50%, #00D4FF 100%)',
                          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                          WebkitMaskComposite: 'xor',
                          maskComposite: 'exclude',
                        }}
                      />
                    )}

                    {/* Plan name */}
                    <h3 className="font-outfit font-bold text-h3" style={{ color: '#1a1a2e' }}>
                      {tier.name}
                    </h3>

                    {/* Price */}
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="font-outfit font-bold" style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', color: '#1a1a2e' }}>
                        {tier.price}
                      </span>
                      {tier.priceNote && (
                        <span className="font-outfit font-semibold text-violet">{tier.priceNote}</span>
                      )}
                    </div>

                    {/* Subtitle */}
                    <p className="font-inter text-body-sm text-silver mt-1">{tier.subtitle}</p>

                    {/* Divider */}
                    <div className="my-6 h-px" style={{ background: 'rgba(11,14,23,0.08)' }} />

                    {/* Features */}
                    <ul className="flex flex-col gap-3.5">
                      {tier.features.map((f) => (
                        <li key={f.label} className="flex items-start gap-3">
                          {f.included ? (
                            <Check size={16} className="mt-0.5 shrink-0 text-success" />
                          ) : (
                            <X size={16} className="mt-0.5 shrink-0" style={{ color: 'rgba(11,14,23,0.15)' }} />
                          )}
                          <span
                            className="font-inter text-body leading-body"
                            style={{
                              color: f.included ? '#1a1a2e' : 'rgba(11,14,23,0.35)',
                              textDecoration: f.included ? 'none' : 'line-through',
                            }}
                          >
                            {f.label}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <div className="mt-8">
                      {tier.popular ? (
                        <Link
                          to={tier.ctaLink}
                          className="block w-full text-center gradient-primary text-white font-inter font-semibold text-[0.9375rem] py-3.5 rounded-full hover:scale-[1.04] hover:shadow-glow transition-all duration-300"
                          style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                        >
                          {tier.cta}
                        </Link>
                      ) : (
                        <Link
                          to={tier.ctaLink}
                          className="block w-full text-center font-inter font-semibold text-[0.9375rem] py-3.5 rounded-full transition-all duration-300 hover:scale-[1.04]"
                          style={{
                            border: '1px solid rgba(123,47,247,0.4)',
                            color: '#1a1a2e',
                            background: 'transparent',
                            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(123,47,247,0.1)'
                            e.currentTarget.style.borderColor = 'rgba(123,47,247,0.7)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent'
                            e.currentTarget.style.borderColor = 'rgba(123,47,247,0.4)'
                          }}
                        >
                          {tier.cta}
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ═══════ SECTION 3: FEATURE COMPARISON ═══════ */}
      <section className="w-full bg-surface-alt" style={{ padding: '100px 0' }}>
        <div className="mx-auto max-w-[1000px] container-padding">
          <ScrollReveal className="text-center mb-12">
            <h2 className="font-outfit font-bold text-h2 text-void mb-3">Compare All Features</h2>
            <p className="font-inter text-body" style={{ color: 'rgba(11,14,23,0.6)' }}>
              A detailed breakdown of what&apos;s included in each plan.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'rgba(11,14,23,0.06)' }}>
              {/* Table header */}
              <div
                className="grid grid-cols-4 gap-4 px-6 py-4"
                style={{
                  background: '#0B0E17',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr',
                }}
              >
                <span className="font-outfit font-semibold text-[0.875rem] text-white uppercase tracking-[0.05em]">Feature</span>
                <span className="font-outfit font-semibold text-[0.875rem] text-white uppercase tracking-[0.05em] text-center">Starter</span>
                <span className="font-outfit font-semibold text-[0.875rem] text-white uppercase tracking-[0.05em] text-center">Pro</span>
                <span className="font-outfit font-semibold text-[0.875rem] text-white uppercase tracking-[0.05em] text-center">Enterprise</span>
              </div>

              {/* Table body */}
              {comparisonCategories.map((cat, catIdx) => (
                <div key={cat.name}>
                  {/* Category header */}
                  <div
                    className="px-6 py-3"
                    style={{ background: 'rgba(123,47,247,0.05)' }}
                  >
                    <span className="font-outfit font-semibold text-body text-violet">{cat.name}</span>
                  </div>
                  {/* Category rows */}
                  {cat.rows.map((row, rowIdx) => (
                    <div
                      key={row.feature}
                      className="grid grid-cols-4 gap-4 px-6 py-3.5 transition-colors duration-200 hover:bg-[rgba(123,47,247,0.03)]"
                      style={{
                        gridTemplateColumns: '2fr 1fr 1fr 1fr',
                        background: (catIdx + rowIdx) % 2 === 0 ? '#fff' : 'rgba(11,14,23,0.02)',
                        borderBottom: '1px solid rgba(11,14,23,0.06)',
                      }}
                    >
                      <span className="font-inter text-body" style={{ color: '#1a1a2e' }}>{row.feature}</span>
                      {(['starter', 'pro', 'enterprise'] as const).map((col) => {
                        const val = row[col]
                        return (
                          <span key={col} className="text-center flex items-center justify-center">
                            {typeof val === 'boolean' ? (
                              val ? (
                                <Check size={16} className="text-success" />
                              ) : (
                                <X size={16} style={{ color: 'rgba(11,14,23,0.15)' }} />
                              )
                            ) : (
                              <span className="font-inter text-body-sm" style={{ color: '#1a1a2e' }}>{val}</span>
                            )}
                          </span>
                        )
                      })}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════ SECTION 4: FAQ ═══════ */}
      <section className="w-full bg-surface" style={{ padding: '100px 0' }}>
        <div className="mx-auto max-w-[800px] container-padding">
          <ScrollReveal className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-electric" />
              <span className="font-outfit font-semibold text-label text-electric uppercase tracking-[0.12em]">
                Pricing Questions
              </span>
            </div>
            <h2 className="font-outfit font-bold text-h2 text-void">Common Pricing Questions</h2>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="bg-white rounded-2xl p-6 md:p-8" style={{ boxShadow: '0 2px 16px rgba(11,14,23,0.05)' }}>
              {faqItems.map((item, i) => (
                <FaqItem
                  key={i}
                  question={item.q}
                  answer={item.a}
                  isOpen={openFaq === i}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                />
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════ SECTION 5: FINAL CTA ═══════ */}
      <section className="w-full gradient-primary" style={{ padding: '80px 0' }}>
        <div className="mx-auto max-w-container container-padding text-center">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.h2 variants={staggerChild} className="font-outfit font-bold text-h2 text-white mb-3">
              Still Have Questions?
            </motion.h2>
            <motion.p variants={staggerChild} className="font-inter text-body-lg mx-auto mb-8 max-w-[600px]" style={{ color: 'rgba(255,255,255,0.85)' }}>
              Our team is here to help you find the perfect plan for your construction business.
            </motion.p>
            <motion.div variants={staggerChild} className="flex flex-wrap items-center justify-center gap-4 mb-4">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center bg-white font-inter font-semibold text-[0.9375rem] px-8 py-3.5 rounded-full hover:scale-[1.04] transition-all duration-300"
                style={{
                  color: '#7B2FF7',
                  transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                Contact Sales
              </Link>
              <Link
                to="/security"
                className="inline-flex items-center justify-center font-inter font-semibold text-[0.9375rem] px-8 py-3.5 rounded-full hover:scale-[1.04] transition-all duration-300"
                style={{
                  border: '1px solid rgba(255,255,255,0.5)',
                  color: '#fff',
                  background: 'transparent',
                  transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                View Security Features
              </Link>
            </motion.div>
            <motion.p variants={staggerChild} className="font-inter text-body-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
              <span className="mr-1">&#10022;</span> Response within 24 hours
            </motion.p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
