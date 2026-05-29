import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  Lock,
  Database,
  ChevronDown,
  FileSignature,
  Eye,
  Timer,
  ShieldCheck,
  FileText,
  CreditCard,
  Scale,
  Globe,
  FileSearch,
  Wallet,
  ScrollText,
  Server,
} from 'lucide-react'

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

/* ─── Stat counter with intersection observer ─── */
function StatCounter({ value, suffix = '', label }: { value: string; suffix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.3 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={visible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      >
        <span className="font-outfit font-bold text-stat text-electric">{value}{suffix}</span>
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={visible ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="font-inter text-body text-[#475569] mt-1"
      >
        {label}
      </motion.p>
    </div>
  )
}

/* ─── data: security layers ─── */
const securityLayers = [
  {
    num: '01',
    title: 'Application Security',
    description: 'The application is being built toward a security-first production process with code review, dependency scanning, rate limits, and input validation.',
    spec: 'OWASP review target · Dependency audit workflow · Rate limiting · Input sanitization · JWT guard tests',
  },
  {
    num: '02',
    title: 'Smart Contract Security',
    description: 'Smart contracts are designed around blockchain security best practices. Independent reviews are planned before real-money production launch.',
    spec: 'eosio.cdt framework · Multi-sig deployment · Immutable logic · Open-source verification · Reentrancy guards',
  },
  {
    num: '03',
    title: 'Encryption & Data Protection',
    description: 'Production data protection is designed around encrypted transport, managed database security controls, and no GCSC custody of user private keys.',
    spec: 'TLS transport · Managed database controls · No private key custody target · Least-privilege access · Backup runbook',
  },
  {
    num: '04',
    title: 'Identity & Access Management',
    description: 'Role-based access control is implemented for homeowner, contractor, and admin flows. Stronger account verification and MFA options are planned for production hardening.',
    spec: 'JWT verification · RBAC · Admin guard tests · Future MFA options · Session policy review',
  },
  {
    num: '05',
    title: 'Blockchain Consensus',
    description: "XPR Network's delegated proof-of-stake (DPoS) consensus validates transactions through elected block producers and supports fast settlement finality for signed escrow actions.",
    spec: 'DPoS consensus · 21 block producers · 0.5s block time · Instant finality · Byzantine fault tolerance',
  },
  {
    num: '06',
    title: 'Disaster Recovery',
    description: 'Backup, restore, monitoring, and rollback procedures are being documented before any real-money pilot. A non-production restore drill is still required.',
    spec: 'PostgreSQL backup script · Restore drill runbook · Monitoring runbook · Rollback checklist · Founder approval gate',
  },
]

/* ─── data: certifications ─── */
const certifications = [
  {
    icon: ShieldCheck,
    title: 'SOC 2 Type II',
    description: 'Independent audit of security controls, availability, and confidentiality measures. This certification is planned for the production compliance roadmap.',
    status: 'Planned',
    statusColor: 'warning' as const,
  },
  {
    icon: Lock,
    title: 'ISO 27001',
    description: 'International standard for information security management systems. GCSC is preparing the controls and documentation required for future certification.',
    status: 'Planned',
    statusColor: 'warning' as const,
  },
  {
    icon: FileText,
    title: 'GDPR Compliant',
    description: 'Privacy controls are being designed around user data access, retention, and deletion workflows for applicable regulatory requirements.',
    status: 'In Progress',
    statusColor: 'warning' as const,
  },
  {
    icon: CreditCard,
    title: 'PCI DSS Level 1',
    description: 'Payment card compliance is planned through tokenized payment providers so GCSC does not store raw card data.',
    status: 'Planned',
    statusColor: 'warning' as const,
  },
  {
    icon: Scale,
    title: 'Digital Asset Legal Review',
    description: 'Legal and regulatory review is planned before any digital asset custody or financial-service expansion.',
    status: 'Planned',
    statusColor: 'warning' as const,
  },
  {
    icon: Globe,
    title: 'State Money Transmitter',
    description: 'Regulatory review is planned with banking and compliance partners before any money transmission activity is launched.',
    status: 'Planned',
    statusColor: 'warning' as const,
  },
]

/* ─── blockchain diagram nodes ─── */
const diagramNodes = [
  {
    icon: Wallet,
    title: 'Homeowner Wallet',
    detail: 'XPR Deposit',
  },
  {
    icon: ScrollText,
    title: 'GCSC Smart Contract',
    detail: 'Escrow Lock & Encrypt',
  },
  {
    icon: Server,
    title: 'XPR Blockchain',
    detail: 'Immutable Record',
  },
  {
    icon: Wallet,
    title: 'Contractor Wallet',
    detail: 'Auto Release',
  },
]

/* ─── detail cards below diagram ─── */
const detailCards = [
  {
    icon: FileSignature,
    title: 'Smart Contract Deployment',
    description: 'The target escrow flow links accepted projects to XPR smart contract actions for funding, milestone approval, and release once deployment and permissions are verified.',
  },
  {
    icon: Eye,
    title: 'Transparent Ledger',
    description: 'On-chain escrow events are designed to be recorded on XPR so homeowner and contractor activity can be verified through transaction evidence.',
  },
  {
    icon: Timer,
    title: 'XPR Finality',
    description: 'XPR Network supports fast transaction finality and low-friction settlement once users sign valid escrow actions through a supported wallet.',
  },
]

/* ═══════════════════════════════════════════ */
/* ═══ MAIN SECURITY PAGE ════════════════════ */
/* ═══════════════════════════════════════════ */
export default function Security() {
  const [openLayer, setOpenLayer] = useState<number | null>(null)

  return (
    <div className="w-full">
      {/* ═══════ SECTION 1: HERO ═══════ */}
      <section
        className="relative w-full flex items-center justify-center overflow-hidden"
        style={{
          minHeight: '65vh',
          background: `
            radial-gradient(ellipse 80% 60% at 20% 40%, rgba(123, 47, 247, 0.18) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 70% 60%, rgba(59, 107, 247, 0.12) 0%, transparent 55%),
            radial-gradient(ellipse 50% 50% at 50% 50%, rgba(0, 212, 255, 0.06) 0%, transparent 50%),
            radial-gradient(ellipse 50% 40% at 50% 90%, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
            #F8FAFC
          `,
        }}
      >
        {/* Scan-line overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,212,255,0.008) 2px, rgba(0,212,255,0.008) 4px)',
            opacity: 0.4,
          }}
        />

        <div className="relative z-10 mx-auto max-w-container container-padding text-center py-36">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Eyebrow */}
            <motion.div variants={staggerChild} className="flex items-center justify-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-electric" />
              <span className="font-outfit font-semibold text-label text-electric uppercase tracking-[0.12em]">
                Security Architecture
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1 variants={staggerChild} className="font-outfit font-bold brand-heading-hero shimmer-text mb-4">
              Fortress-Grade Protection
            </motion.h1>

            {/* Subheading */}
            <motion.p variants={staggerChild} className="font-inter text-body-lg text-[#475569] max-w-[640px] mx-auto">
              GCSC is designed to protect construction payments with strong security controls, transparent escrow records, and planned smart contract settlement.
            </motion.p>

            {/* Security badges */}
            <motion.div
              variants={staggerChild}
              className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mt-10"
            >
              {[
                { icon: Shield, text: 'Compliance Roadmap' },
                { icon: Lock, text: 'AES-256 Target' },
                { icon: Database, text: 'On-Chain Immutable' },
              ].map((badge, i) => (
                <motion.div
                  key={badge.text}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.8 + i * 0.1,
                    ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
                  }}
                  className="flex items-center gap-2.5 px-5 py-3 rounded-2xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.85)',
                    border: '1px solid rgba(123, 47, 247, 0.2)',
                    backdropFilter: 'blur(12px) saturate(150%)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                  }}
                >
                  <badge.icon size={16} className="text-electric shrink-0" />
                  <span className="font-inter font-medium text-body-sm gradient-text">{badge.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════ SECTION 2: STATS BAR ═══════ */}
      <section
        className="w-full"
        style={{
          background: '#FFFFFF',
          borderTop: '1px solid rgba(123,47,247,0.1)',
          borderBottom: '1px solid rgba(123,47,247,0.1)',
          padding: '60px 0',
        }}
      >
        <div className="mx-auto max-w-container container-padding">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            <StatCounter value="AES-256" label="Data Protection" />
            <StatCounter value="Zero" label="XPR Gas Fees" />
            <StatCounter value="DPoS" label="XPR Consensus" />
            <StatCounter value="On-chain" label="Escrow Records" />
          </div>
        </div>
      </section>

      {/* ═══════ SECTION 3: BLOCKCHAIN ESCROW ═══════ */}
      <section className="w-full bg-surface" style={{ padding: '120px 0' }}>
        <div className="mx-auto max-w-container container-padding">
          {/* Header */}
          <ScrollReveal className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-electric" />
              <span className="font-outfit font-semibold text-label text-electric uppercase tracking-[0.12em]">
                Blockchain Escrow
              </span>
            </div>
            <h2 className="font-outfit font-bold text-h2 gradient-text mb-3">
              How XPR Blockchain Secures Every Payment
            </h2>
            <p className="font-inter text-body-lg max-w-[720px] mx-auto" style={{ color: 'rgba(15,23,42,0.6)' }}>
              GCSC leverages the XPR Network&apos;s high-performance blockchain to create smart contracts that are transparent, immutable, and automatic.
            </p>
          </ScrollReveal>

          {/* Architecture Diagram */}
          <ScrollReveal delay={0.1}>
            <div className="max-w-[900px] mx-auto">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2 relative">
                {diagramNodes.map((node, i) => (
                  <div key={node.title} className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
                    {/* Node */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{
                        duration: 0.8,
                        delay: i * 0.15,
                        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                      }}
                      className="flex-1 md:flex-none bg-white rounded-2xl p-6 md:p-7 text-center"
                      style={{
                        boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                        minWidth: '160px',
                      }}
                    >
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
                        style={{ background: 'rgba(123,47,247,0.08)' }}
                      >
                        <node.icon size={28} className="text-violet" />
                      </div>
                      <h4 className="font-outfit font-semibold text-h4 gradient-text">
                        {node.title}
                      </h4>
                      <p className="font-inter text-body-sm mt-1" style={{ color: 'rgba(15,23,42,0.65)' }}>
                        {node.detail}
                      </p>
                    </motion.div>

                    {/* Arrow (hidden on last item and on mobile) */}
                    {i < diagramNodes.length - 1 && (
                      <div className="hidden md:flex flex-col items-center shrink-0 w-8 relative">
                        <div className="w-full h-0.5 gradient-primary relative overflow-visible">
                          {/* Animated traveling dot */}
                          <div
                            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-electric"
                            style={{
                              animation: `travelArrow 2s linear infinite`,
                              animationDelay: `${i * 0.5}s`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Detail Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-[900px] mx-auto mt-12">
            {detailCards.map((card, i) => (
              <ScrollReveal key={card.title} delay={0.1 + i * 0.1}>
                <div
                  className="bg-white rounded-xl p-7 h-full"
                  style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: 'rgba(123,47,247,0.08)' }}>
                    <card.icon size={20} className="text-violet" />
                  </div>
                  <h4 className="font-outfit font-semibold text-h4 mb-2 gradient-text">
                    {card.title}
                  </h4>
                  <p className="font-inter text-body-sm leading-body-sm" style={{ color: 'rgba(15,23,42,0.65)' }}>
                    {card.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ SECTION 4: SECURITY LAYERS ═══════ */}
      <section className="w-full" style={{ background: '#F8FAFC', padding: '120px 0' }}>
        <div className="mx-auto max-w-[900px] container-padding">
          <ScrollReveal className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-electric" />
              <span className="font-outfit font-semibold text-label text-electric uppercase tracking-[0.12em]">
                Defense in Depth
              </span>
            </div>
            <h2 className="font-outfit font-bold text-h2 gradient-text">
              Multi-Layered Security Architecture
            </h2>
          </ScrollReveal>

          <div>
            {securityLayers.map((layer, i) => (
              <motion.div
                key={layer.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.08,
                  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                }}
              >
                <button
                  onClick={() => setOpenLayer(openLayer === i ? null : i)}
                  className="w-full flex items-center justify-between py-6 px-4 md:px-8 text-left transition-colors duration-200"
                  style={{
                    borderBottom: '1px solid rgba(15,23,42,0.08)',
                    background: openLayer === i ? 'rgba(123,47,247,0.05)' : 'transparent',
                  }}
                >
                  <div className="flex items-center gap-4 md:gap-6">
                    <span className="font-outfit font-bold text-body-sm text-electric">{layer.num}</span>
                    <span className="font-outfit font-semibold text-body gradient-text">{layer.title}</span>
                  </div>
                  <ChevronDown
                    size={20}
                    className="text-[#94A3B8] shrink-0 transition-transform duration-300"
                    style={{
                      transform: openLayer === i ? 'rotate(180deg)' : 'rotate(0deg)',
                      transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {openLayer === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 md:px-8 pb-6 pt-2">
                        <p className="font-inter text-body text-[#475569] leading-body mb-4">
                          {layer.description}
                        </p>
                        <div
                          className="inline-block rounded-lg px-4 py-3 font-inter text-mono leading-mono"
                          style={{
                            background: 'rgba(123,47,247,0.06)',
                            border: '1px solid rgba(123,47,247,0.15)',
                            color: '#0F172A',
                            fontSize: '0.8125rem',
                          }}
                        >
                          {layer.spec}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ SECTION 5: COMPLIANCE & CERTIFICATIONS ═══════ */}
      <section className="w-full bg-surface" style={{ padding: '120px 0' }}>
        <div className="mx-auto max-w-[900px] container-padding">
          <ScrollReveal className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-electric" />
              <span className="font-outfit font-semibold text-label text-electric uppercase tracking-[0.12em]">
                Compliance Roadmap
              </span>
            </div>
            <h2 className="font-outfit font-bold text-h2 gradient-text mb-3">
              Compliance & Security Roadmap
            </h2>
            <p className="font-inter text-body max-w-[560px] mx-auto" style={{ color: 'rgba(15,23,42,0.6)' }}>
              GCSC is preparing the controls, reviews, and documentation required for regulated production use.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {certifications.map((cert, i) => (
              <ScrollReveal key={cert.title} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                  className="bg-white rounded-2xl p-8 text-center h-full flex flex-col items-center"
                  style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                    style={{ background: 'rgba(123,47,247,0.08)' }}
                  >
                    <cert.icon size={28} className="text-violet" />
                  </div>
                  <h3 className="font-outfit font-semibold text-h3 gradient-text">
                    {cert.title}
                  </h3>
                  <p className="font-inter text-body-sm mt-2 leading-body-sm" style={{ color: 'rgba(15,23,42,0.65)' }}>
                    {cert.description}
                  </p>
                  <span
                    className="mt-3 inline-block font-inter font-semibold text-[0.75rem] px-3 py-1 rounded-full"
                    style={{
                      background: 'rgba(245,158,11,0.1)',
                      color: '#F59E0B',
                    }}
                  >
                    {cert.status}
                  </span>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ SECTION 6: AUDIT REPORT CTA ═══════ */}
      <section
        className="w-full"
        style={{ background: '#F1F5F9', padding: '80px 0' }}
      >
        <div className="mx-auto max-w-container container-padding text-center">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.div
              variants={staggerChild}
              className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-6"
              style={{
                background: 'rgba(0,212,255,0.1)',
                animation: 'glow-pulse 3s ease-in-out infinite',
              }}
            >
              <FileSearch size={32} className="text-electric" />
            </motion.div>
            <motion.h2 variants={staggerChild} className="font-outfit font-bold text-h2 gradient-text mb-3">
              Independent Security Audits
            </motion.h2>
            <motion.p variants={staggerChild} className="font-inter text-body-lg text-[#475569] max-w-[600px] mx-auto mb-8">
              Independent smart contract and infrastructure audits are planned before real-money production launch. Audit reports will be published when complete.
            </motion.p>
            <motion.div variants={staggerChild} className="flex flex-wrap items-center justify-center gap-4">
              <button
                className="inline-flex items-center justify-center gradient-primary text-white font-inter font-semibold text-[0.9375rem] px-8 py-3.5 rounded-full hover:scale-[1.04] hover:shadow-glow transition-all duration-300"
                style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                onClick={() => alert('Audit report download coming soon!')}
              >
                Audit Reports Coming Soon
              </button>
              <button
                className="inline-flex items-center justify-center font-inter font-semibold text-[0.9375rem] px-8 py-3.5 rounded-full hover:scale-[1.04] transition-all duration-300"
                style={{
                  border: '1px solid rgba(123,47,247,0.4)',
                  color: '#0F172A',
                  background: 'transparent',
                  transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                onClick={() => alert('Reports archive coming soon!')}
              >
                View Audit Roadmap
              </button>
            </motion.div>
            <motion.p variants={staggerChild} className="font-inter text-body-sm text-[#94A3B8] mt-4">
              No completed third-party production audit has been published yet.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ═══════ SECTION 7: FINAL CTA ═══════ */}
      <section className="w-full gradient-primary" style={{ padding: '80px 0' }}>
        <div className="mx-auto max-w-container container-padding text-center">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.h2 variants={staggerChild} className="font-outfit font-bold text-h2 text-white mb-3">
              Ready to Build with Confidence?
            </motion.h2>
            <motion.p variants={staggerChild} className="font-inter text-body-lg mx-auto mb-8 max-w-[560px]" style={{ color: 'rgba(255,255,255,0.85)' }}>
              Use GCSC&apos;s security-focused escrow workflow to protect construction payments with clear milestone records.
            </motion.p>
            <motion.div variants={staggerChild}>
              <Link
                to="/pricing"
                className="inline-flex items-center justify-center bg-white font-inter font-semibold text-[0.9375rem] px-8 py-3.5 rounded-full hover:scale-[1.04] transition-all duration-300"
                style={{
                  color: '#7B2FF7',
                  transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                Get Started for Free
              </Link>
            </motion.div>
            <motion.p variants={staggerChild} className="font-inter text-body-sm mt-4" style={{ color: 'rgba(255,255,255,0.7)' }}>
              <span className="mr-1">&#10022;</span> No credit card required · Instant setup
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ─── traveling dot keyframe (injected via style tag) ─── */}
      <style>{`
        @keyframes travelArrow {
          0% { left: 0; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  )
}
