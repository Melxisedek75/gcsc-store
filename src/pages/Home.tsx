import { useRef, useState } from 'react'
import { Link } from 'react-router'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Users,
  ShieldCheck,
  Home,
  Lock,
  HardHat,
  CheckCircle2,
  Star,
  Plus,
  Zap,
  Globe,
} from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

/* ───────── Section Label (Eyebrow) ───────── */
function SectionLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span
        className="w-[6px] h-[6px] rounded-full"
        style={{ backgroundColor: '#00D4FF' }}
      />
      <span
        className="font-outfit font-semibold text-label uppercase tracking-label"
        style={{ color: '#00D4FF' }}
      >
        {text}
      </span>
    </div>
  )
}

/* ───────── Particle Field (CSS-based) ───────── */
function ParticleField() {
  const particles = useRef(
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 15 + 15,
      delay: Math.random() * 15,
      opacity: Math.random() * 0.08 + 0.03,
    }))
  ).current

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            backgroundColor: `rgba(123, 47, 247, ${p.opacity})`,
            animation: `float-up ${p.duration}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

/* ───────── Progress Ring ───────── */
function ProgressRing({ progress, size = 60 }: { progress: number; size?: number }) {
  const radius = (size - 4) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="rgba(15,23,42,0.1)"
        strokeWidth={3}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#00D4FF"
        strokeWidth={3}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
      />
    </svg>
  )
}

/* ════════════════════════════════════════════
   SECTION 1 — HERO
   ════════════════════════════════════════════ */
function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const orb1Ref = useRef<HTMLDivElement>(null)
  const orb2Ref = useRef<HTMLDivElement>(null)
  const orb3Ref = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    // Orbs fade in
    if (orb1Ref.current && orb2Ref.current && orb3Ref.current) {
      tl.fromTo(
        [orb1Ref.current, orb2Ref.current, orb3Ref.current],
        { opacity: 0 },
        { opacity: 0.3, duration: 1.5 },
        0
      )
    }

    // Content animations
    if (contentRef.current && sectionRef.current) {
      const eyebrow = contentRef.current.querySelector('.hero-eyebrow')
      const h1l1 = contentRef.current.querySelector('.hero-h1-l1')
      const h1l2 = contentRef.current.querySelector('.hero-h1-l2')
      const sub = contentRef.current.querySelector('.hero-sub')
      const cta = contentRef.current.querySelector('.hero-cta')
      const card = sectionRef.current.querySelector('.hero-card')
      const notif = sectionRef.current.querySelector('.hero-notif')

      if (eyebrow) tl.fromTo(eyebrow, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, 0.5)
      if (h1l1) tl.fromTo(h1l1, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, 0.7)
      if (h1l2) tl.fromTo(h1l2, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, 0.9)
      if (sub) tl.fromTo(sub, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, 1.1)
      if (cta) tl.fromTo(cta, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, 1.3)
      if (card) tl.fromTo(card, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.2, ease: 'back.out(1.2)' }, 0.8)
      if (notif) tl.fromTo(notif, { x: 30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8 }, 1.8)
    }
  }, { scope: sectionRef })

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{
        minHeight: '100dvh',
        background: '#F8FAFC',
      }}
    >
      {/* Subtle light overlay for readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)' }}
      />

      {/* Mesh gradient orbs - very subtle for light theme */}
      <div
        ref={orb1Ref}
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none opacity-0"
        style={{
          top: '-20%',
          left: '-10%',
          background: 'radial-gradient(circle, rgba(123,47,247,0.12) 0%, transparent 70%)',
          filter: 'blur(120px)',
          animation: 'meshBreathe 15s ease-in-out infinite',
        }}
      />
      <div
        ref={orb2Ref}
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none opacity-0"
        style={{
          top: '30%',
          right: '-15%',
          background: 'radial-gradient(circle, rgba(59,107,247,0.1) 0%, transparent 70%)',
          filter: 'blur(120px)',
          animation: 'meshBreathe 18s ease-in-out infinite 3s',
        }}
      />
      <div
        ref={orb3Ref}
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none opacity-0"
        style={{
          bottom: '-10%',
          left: '40%',
          background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)',
          filter: 'blur(120px)',
          animation: 'meshBreathe 20s ease-in-out infinite 6s',
        }}
      />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Particle field */}
      <ParticleField />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-container container-padding flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-8 py-20 lg:py-0" style={{ minHeight: 'calc(100dvh - 72px)' }}>
        {/* Left column — Text */}
        <div ref={contentRef} className="flex-1 max-w-[600px] text-center lg:text-left">
          <div className="hero-eyebrow opacity-0">
            <SectionLabel text="XPR BLOCKCHAIN POWERED" />
          </div>
          <h1 className="font-outfit font-bold text-hero leading-hero tracking-hero">
            <span className="hero-h1-l1 block opacity-0" style={{ color: '#0F172A' }}>
              Build with Trust.
            </span>
            <span className="hero-h1-l2 block opacity-0 gradient-text">
              Pay with Confidence.
            </span>
          </h1>
          <p className="hero-sub opacity-0 font-inter text-body-lg leading-body-lg mt-6" style={{ color: '#475569' }}>
            The first construction marketplace powered by XPR blockchain escrow. Smart contracts protect every payment, every milestone, every project.
          </p>
          <div className="hero-cta opacity-0 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mt-8">
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center gradient-primary text-white font-inter font-semibold text-[0.9375rem] px-8 py-[14px] rounded-full hover:scale-[1.04] hover:shadow-glow active:scale-[0.98] transition-all duration-300"
              style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              Get Started
            </Link>
            <button
              className="inline-flex items-center justify-center bg-transparent font-inter font-semibold text-[0.9375rem] px-8 py-[14px] rounded-full border hover:bg-[rgba(123,47,247,0.08)] transition-all duration-300 cursor-pointer"
              style={{ borderColor: 'rgba(123,47,247,0.4)', color: '#0F172A' }}
              onClick={() => {
                document.getElementById('escrow-section')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Watch How It Works
            </button>
          </div>
          <p className="mt-5 font-inter text-body-sm" style={{ color: 'rgba(71,85,105,0.7)' }}>
            <span style={{ color: '#00D4FF' }}>&#10022;</span> Free to join. No credit card required.
          </p>
        </div>

        {/* Right column — Glass Card */}
        <div className="flex-1 flex justify-center items-center max-w-[460px]">
          <div className="hero-card opacity-0 relative glass-card p-8 w-full" style={{ maxWidth: '420px', minHeight: '480px' }}>
            {/* Progress ring */}
            <div className="flex justify-center mb-6">
              <ProgressRing progress={35} size={70} />
            </div>

            {/* GCSC Logo Mark */}
            <div className="flex justify-center mb-4">
              <img
                src="/gcsc-logo-round-80.png"
                alt="GCSC Smart Contract"
                className="w-20 h-20 rounded-full animate-glow-pulse object-cover"
              />
            </div>

            <div className="text-center mb-6">
              <h3 className="font-outfit font-semibold text-h3 text-[#0F172A]">GCSC Smart Contract</h3>
              <p className="font-inter text-body-sm" style={{ color: '#475569' }}>Blockchain Escrow</p>
            </div>

            {/* Status pills */}
            <div className="flex justify-center gap-3 mb-6">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-inter text-[0.75rem] font-medium"
                style={{ backgroundColor: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)' }}
              >
                <Lock size={12} /> Protected
              </span>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-inter text-[0.75rem] font-medium"
                style={{ backgroundColor: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.25)' }}
              >
                <span className="text-[0.7rem]">&#9889;</span> Instant
              </span>
            </div>

            {/* Notification card */}
            <div
              className="hero-notif opacity-0 absolute -bottom-4 -right-4 glass-card p-4 flex items-start gap-3"
              style={{ maxWidth: '260px', borderRadius: '12px', borderLeft: '3px solid #10B981' }}
            >
              <CheckCircle2 size={20} style={{ color: '#10B981', flexShrink: 0 }} className="mt-0.5" />
              <div>
                <p className="font-inter text-[0.75rem] font-medium text-[#0F172A] leading-snug">
                  Payment Released
                </p>
                <p className="font-inter text-[0.7rem] mt-1" style={{ color: '#475569' }}>
                  Milestone 2 of 3 &middot; Funds in Escrow
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════
   SECTION 2 — STATS BAR
   ════════════════════════════════════════════ */
const features = [
  {
    icon: ShieldCheck,
    title: 'Blockchain Escrow',
    description: 'Smart contracts hold funds securely until milestones are completed and approved by both parties.',
    color: '#7B2FF7',
  },
  {
    icon: Zap,
    title: 'Zero Gas Fees',
    description: 'Powered by XPR Network with zero gas fees and 3-second transaction finality.',
    color: '#3B6BF7',
  },
  {
    icon: Lock,
    title: 'AES-256 Encryption',
    description: 'All escrow funds are encrypted with military-grade security protocols.',
    color: '#00D4FF',
  },
  {
    icon: Globe,
    title: 'On-Chain Identity',
    description: 'Verified decentralized identity ensures trust between homeowners and contractors.',
    color: '#A855F7',
  },
]

function FeatureBlock({ feature, index }: { feature: typeof features[0]; index: number }) {
  return (
    <motion.div
      className="flex-1 text-center px-4 py-6 group cursor-default"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -6, scale: 1.02 }}
    >
      <motion.div
        className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
        style={{ backgroundColor: `${feature.color}15` }}
        whileHover={{ rotate: 5, scale: 1.1 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
      </motion.div>
      <h3 className="font-outfit font-semibold text-body" style={{ color: '#0F172A' }}>
        {feature.title}
      </h3>
      <p className="font-inter text-body-sm mt-2 max-w-[200px] mx-auto" style={{ color: '#475569' }}>
        {feature.description}
      </p>
    </motion.div>
  )
}

function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    if (!sectionRef.current) return
    const blocks = sectionRef.current.querySelectorAll('.feature-block')
    gsap.fromTo(
      blocks,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
      }
    )
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} className="relative w-full bg-white">
      {/* Top gradient line */}
      <div className="w-full h-[1px]" style={{ background: 'linear-gradient(90deg, transparent, rgba(123,47,247,0.3), rgba(59,107,247,0.3), transparent)' }} />

      <div className="mx-auto max-w-container container-padding py-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-2">
          {features.map((feature, i) => (
            <div key={feature.title} className="feature-block flex-1 text-center relative">
              <FeatureBlock feature={feature} index={i} />
              {i < features.length - 1 && (
                <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-16" style={{ backgroundColor: 'rgba(148,163,184,0.25)' }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════
   SECTION 3 — HOW IT WORKS
   ════════════════════════════════════════════ */
const steps = [
  {
    number: 1,
    icon: FileText,
    title: 'Post Your Project',
    description:
      'Describe your construction project in minutes. Set your budget, timeline, and requirements. Our AI matches you with qualified, verified contractors instantly.',
  },
  {
    number: 2,
    icon: Users,
    title: 'Receive Competitive Bids',
    description:
      'Multiple vetted contractors bid on your project. Compare portfolios, read verified reviews, and communicate directly before making your choice.',
  },
  {
    number: 3,
    icon: ShieldCheck,
    title: 'Escrow Protection & Release',
    description:
      'Funds are held in a secure XPR blockchain escrow. Payments release automatically when milestones are completed and approved — no disputes, no delays.',
  },
]

function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    if (!sectionRef.current) return
    const cards = sectionRef.current.querySelectorAll('.step-card')
    gsap.fromTo(
      cards,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
        },
      }
    )
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} className="relative w-full" style={{ backgroundColor: '#F1F5F9' }}>
      <div className="mx-auto max-w-container container-padding py-24 lg:py-32">
        {/* Header */}
        <div className="text-center mb-16">
          <SectionLabel text="SIMPLE PROCESS" />
          <h2 className="font-outfit font-bold text-h1 leading-h1 tracking-h1" style={{ color: '#0F172A' }}>
            Three Steps to Secure Construction Payments
          </h2>
          <p className="font-inter text-body-lg leading-body-lg mt-4 max-w-[640px] mx-auto" style={{ color: 'rgba(15,23,42,0.6)' }}>
            From project posting to final payment release — every step protected by XPR blockchain smart contracts.
          </p>
        </div>

        {/* Step Cards */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="step-card relative bg-white rounded-[20px] p-10 lg:p-12 transition-all duration-400"
              style={{
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)'
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.06)'
              }}
            >
              {/* Step number circle with gradient border */}
              <div className="relative w-16 h-16 rounded-full flex items-center justify-center mb-6 p-[2px]" style={{ background: 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 50%, #00D4FF 100%)' }}>
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  <span className="font-outfit font-bold text-[1.5rem] gradient-text">{step.number}</span>
                </div>
              </div>

              {/* Icon */}
              <div className="mb-4" style={{ color: '#7B2FF7' }}>
                <step.icon size={48} strokeWidth={1.5} />
              </div>

              {/* Title */}
              <h3 className="font-outfit font-semibold text-h3 leading-h3" style={{ color: '#0F172A' }}>
                {step.title}
              </h3>

              {/* Description */}
              <p className="font-inter text-body leading-body mt-3" style={{ color: 'rgba(15,23,42,0.65)' }}>
                {step.description}
              </p>

              {/* Connecting line (between cards, desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-[50%] -right-4 w-8 border-t-2 border-dotted" style={{ borderColor: 'rgba(123,47,247,0.25)' }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════
   SECTION 4 — ESCROW SIMULATION
   ════════════════════════════════════════════ */
const phases = [
  {
    number: 1,
    title: 'Deposit',
    description: 'Homeowner deposits funds into the XPR blockchain escrow. Funds are immediately locked and encrypted with AES-256.',
  },
  {
    number: 2,
    title: 'Work',
    description: 'Contractor completes the construction work. Milestone tracking keeps both parties aligned on progress.',
  },
  {
    number: 3,
    title: 'Verify',
    description: 'Homeowner reviews and approves the completed work. Smart contract validates the approval on-chain.',
  },
  {
    number: 4,
    title: 'Release',
    description: 'Payment is automatically released to the contractor. Transaction is recorded immutably on the XPR blockchain.',
  },
]

function EscrowSimulation() {
  const sectionRef = useRef<HTMLElement>(null)
  const pinnedRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const [activePhase, setActivePhase] = useState(0)

  useGSAP(() => {
    if (!sectionRef.current || !pinnedRef.current || !progressRef.current) return

    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: '+=200%',
      pin: pinnedRef.current,
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress
        const phase = Math.min(Math.floor(progress * 4), 3)
        setActivePhase(phase)
        if (progressRef.current) {
          progressRef.current.style.width = `${progress * 100}%`
        }
      },
    })
  }, { scope: sectionRef })

  return (
    <section id="escrow-section" ref={sectionRef} className="relative w-full" style={{ backgroundColor: '#F8FAFC' }}>
      <div ref={pinnedRef} className="min-h-[100dvh] flex flex-col">
        {/* Header */}
        <div className="mx-auto max-w-container container-padding pt-20 pb-10 text-center">
          <SectionLabel text="LIVE DEMO" />
          <h2 className="font-outfit font-bold text-h1 leading-h1 tracking-h1" style={{ color: '#0F172A' }}>
            See How Escrow Works
          </h2>
          <p className="font-inter text-body-lg leading-body-lg mt-4 max-w-[600px] mx-auto" style={{ color: '#475569' }}>
            Watch how funds flow securely from homeowner to contractor through our blockchain escrow. Scroll to advance.
          </p>
        </div>

        {/* Progress bar */}
        <div className="mx-auto max-w-container container-padding w-full mb-12">
          <div className="w-full h-[4px] rounded-full" style={{ backgroundColor: 'rgba(15,23,42,0.08)' }}>
            <div
              ref={progressRef}
              className="h-full rounded-full gradient-primary transition-none"
              style={{ width: '0%' }}
            />
          </div>
        </div>

        {/* Simulation stage */}
        <div className="flex-1 flex flex-col items-center justify-center mx-auto max-w-container container-padding pb-20">
          {/* Nodes */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 lg:gap-10 mb-12 w-full max-w-[900px]">
            {/* Node 1 — Homeowner */}
            <div
              className="glass-card p-6 text-center w-full sm:w-[200px] transition-all duration-500"
              style={{
                borderColor: activePhase >= 0 ? 'rgba(123,47,247,0.5)' : 'rgba(123,47,247,0.15)',
                boxShadow: activePhase >= 0 ? '0 0 30px rgba(123,47,247,0.2)' : undefined,
              }}
            >
              <div className="flex justify-center mb-3" style={{ color: activePhase >= 0 ? '#00D4FF' : '#94A3B8' }}>
                <Home size={40} />
              </div>
              <h4 className="font-outfit font-semibold text-h4 text-[#0F172A]">Homeowner</h4>
              <p className="font-inter text-body-sm mt-1" style={{ color: '#475569' }}>Deposits Funds</p>
            </div>

            {/* Arrow 1 */}
            <div className="flex items-center justify-center" style={{ color: '#7B2FF7' }}>
              <svg width="60" height="20" className="hidden sm:block">
                <defs>
                  <linearGradient id="arrowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#7B2FF7" />
                    <stop offset="100%" stopColor="#3B6BF7" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="10" x2="50" y2="10" stroke="url(#arrowGrad)" strokeWidth="2" />
                <polygon points="50,5 60,10 50,15" fill="#3B6BF7" />
              </svg>
              <span className="sm:hidden text-violet text-2xl">&darr;</span>
            </div>

            {/* Node 2 — XPR Escrow */}
            <div
              className="glass-card p-6 text-center w-full sm:w-[200px] transition-all duration-500"
              style={{
                borderColor: activePhase >= 1 ? 'rgba(123,47,247,0.5)' : 'rgba(123,47,247,0.15)',
                boxShadow: activePhase >= 1 ? '0 0 30px rgba(123,47,247,0.2)' : undefined,
              }}
            >
              <div className="flex justify-center mb-3" style={{ color: activePhase >= 1 ? '#00D4FF' : '#94A3B8' }}>
                <Lock size={40} />
              </div>
              <h4 className="font-outfit font-semibold text-h4 text-[#0F172A]">XPR Escrow</h4>
              <p className="font-inter text-body-sm mt-1" style={{ color: '#475569' }}>Funds Locked</p>
            </div>

            {/* Arrow 2 */}
            <div className="flex items-center justify-center" style={{ color: '#7B2FF7' }}>
              <svg width="60" height="20" className="hidden sm:block">
                <line x1="0" y1="10" x2="50" y2="10" stroke="url(#arrowGrad)" strokeWidth="2" />
                <polygon points="50,5 60,10 50,15" fill="#3B6BF7" />
              </svg>
              <span className="sm:hidden text-violet text-2xl">&darr;</span>
            </div>

            {/* Node 3 — Contractor */}
            <div
              className="glass-card p-6 text-center w-full sm:w-[200px] transition-all duration-500"
              style={{
                borderColor: activePhase >= 3 ? 'rgba(16,185,129,0.5)' : 'rgba(123,47,247,0.15)',
                boxShadow: activePhase >= 3 ? '0 0 30px rgba(16,185,129,0.2)' : undefined,
              }}
            >
              <div className="flex justify-center mb-3" style={{ color: activePhase >= 3 ? '#10B981' : '#94A3B8' }}>
                <HardHat size={40} />
              </div>
              <h4 className="font-outfit font-semibold text-h4 text-[#0F172A]">Contractor</h4>
              <p className="font-inter text-body-sm mt-1" style={{ color: '#475569' }}>Gets Paid</p>
            </div>
          </div>

          {/* Phase detail card */}
          <div className="w-full max-w-[600px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePhase}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                className="glass-card p-8"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-outfit font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 100%)' }}
                  >
                    {phases[activePhase].number}
                  </div>
                  <h3 className="font-outfit font-semibold text-h3 text-[#0F172A]">
                    {phases[activePhase].title}
                  </h3>
                  {activePhase === 3 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring' }}
                    >
                      <CheckCircle2 size={24} style={{ color: '#10B981' }} />
                    </motion.div>
                  )}
                </div>
                <p className="font-inter text-body leading-body" style={{ color: '#475569' }}>
                  {phases[activePhase].description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Phase 4 confetti */}
          {activePhase === 3 && <ConfettiBurst />}
        </div>
      </div>
    </section>
  )
}

/* ───────── Confetti Burst ───────── */
function ConfettiBurst() {
  const colors = ['#7B2FF7', '#3B6BF7', '#00D4FF', '#10B981']
  const particles = useRef(
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 400,
      y: (Math.random() - 0.5) * 400 - 100,
      rotation: Math.random() * 720 - 360,
      scale: Math.random() * 0.5 + 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: Math.random() * 0.8 + 0.7,
    }))
  ).current

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute left-1/2 top-1/2 w-2 h-2 rounded-sm"
          style={{ backgroundColor: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
          animate={{
            x: p.x,
            y: p.y,
            opacity: 0,
            scale: 0,
            rotate: p.rotation,
          }}
          transition={{ duration: p.duration, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}

/* ════════════════════════════════════════════
   SECTION 5 — TESTIMONIALS
   ════════════════════════════════════════════ */
const testimonials = [
  {
    quote: 'GCSC eliminated the payment anxiety that used to keep me up at night. My contractor gets paid on time, and I know my money is safe until the work is done.',
    name: 'Michael Torres',
    role: 'Homeowner, Miami',
  },
  {
    quote: "As a contractor, GCSC has transformed how I work. Clients trust me more because they can see exactly where their money goes. I've won 40% more bids since joining.",
    name: 'Sarah Chen',
    role: 'Licensed Contractor, Austin',
  },
  {
    quote: 'The milestone system is brilliant. We broke our renovation into 6 phases, and each payment released automatically when we approved the work. Zero disputes.',
    name: 'David & Lisa Park',
    role: 'Homeowners, Seattle',
  },
]

const partners = [
  { name: 'XPR Network', logo: '/logos/xpr-network-logo.png', href: 'https://xprnetwork.org/' },
  { name: 'Metal Pay', logo: '/logos/metalpay-logo.png', href: 'https://metalpay.com/' },
]

function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    if (!sectionRef.current) return
    const cards = sectionRef.current.querySelectorAll('.testimonial-card')
    const logos = sectionRef.current.querySelectorAll('.partner-logo')

    gsap.fromTo(
      cards,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
      }
    )
    gsap.fromTo(
      logos,
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 60%' },
      }
    )
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} className="relative w-full" style={{ backgroundColor: '#E2E8F0' }}>
      {/* Subtle dot pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle, #0F172A 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative mx-auto max-w-container container-padding py-24 lg:py-32">
        {/* Header */}
        <div className="text-center mb-16">
          <SectionLabel text="TRUSTED BY BUILDERS" />
          <h2 className="font-outfit font-bold text-h2 leading-h2 tracking-h2" style={{ color: '#0F172A' }}>
            What Our Users Say
          </h2>
        </div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="testimonial-card bg-white rounded-[16px] p-8 transition-all duration-300"
              style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}
            >
              <div className="mb-4">
                <span className="font-outfit text-[2rem] leading-none" style={{ color: '#7B2FF7' }}>&ldquo;</span>
              </div>
              <p className="font-inter text-body-lg leading-body-lg italic" style={{ color: '#0F172A' }}>
                {t.quote}
              </p>

              {/* Author row */}
              <div
                className="flex items-center gap-3 mt-6 pt-5"
                style={{ borderTop: '1px solid rgba(15,23,42,0.06)' }}
              >
                {/* Avatar */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-outfit font-bold text-white text-[1rem]"
                  style={{ background: 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 50%, #00D4FF 100%)' }}
                >
                  {t.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-outfit font-semibold text-body" style={{ color: '#0F172A' }}>
                    {t.name}
                  </p>
                  <p className="font-inter text-body-sm" style={{ color: '#475569' }}>
                    {t.role}
                  </p>
                </div>
                {/* Stars */}
                <div className="flex gap-0.5 shrink-0">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="#F59E0B" style={{ color: '#F59E0B' }} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Partner logos */}
        <div className="text-center">
          <p
            className="font-inter text-body-sm uppercase mb-8"
            style={{ color: '#94A3B8', letterSpacing: '0.08em' }}
          >
            POWERED BY
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10 lg:gap-16">
            {partners.map((partner) => (
              <a
                key={partner.name}
                href={partner.href}
                target="_blank"
                rel="noopener noreferrer"
                className="partner-logo-real transition-all duration-300"
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-8 w-auto object-contain"
                  title={partner.name}
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════
   SECTION 6 — FAQ ACCORDION
   ════════════════════════════════════════════ */
const faqItems = [
  {
    question: 'What is GCSC Smart Contract?',
    answer: 'GCSC (Global Construction Smart Contract) is a blockchain-powered construction marketplace that uses XPR Network smart contracts to escrow and release payments based on completed project milestones. We protect both homeowners and contractors by ensuring funds are only released when work is verified complete.',
  },
  {
    question: 'How does the escrow process work?',
    answer: 'When a project begins, the homeowner deposits funds into an XPR blockchain escrow. These funds are locked by a smart contract. As contractors complete each milestone, the homeowner verifies the work, and the smart contract automatically releases payment. No manual transfers, no disputes.',
  },
  {
    question: 'Is GCSC free to use?',
    answer: 'Yes, creating an account and posting projects is completely free. GCSC charges a small platform fee (2.5%) only when a payment is released from escrow. There are no monthly subscriptions or hidden fees.',
  },
  {
    question: 'What blockchain does GCSC use?',
    answer: 'GCSC is built on the XPR Network (formerly Proton), a high-performance Layer 1 blockchain with instant finality, zero gas fees for users, and enterprise-grade security. Every transaction is recorded immutably on-chain.',
  },
  {
    question: 'How are contractors verified?',
    answer: 'Every contractor on GCSC undergoes a rigorous verification process including license validation, background checks, insurance verification, and portfolio review. Only verified contractors can bid on projects.',
  },
  {
    question: "What happens if there's a dispute?",
    answer: "In the rare event of a dispute, GCSC's decentralized arbitration system reviews on-chain evidence and milestone records. Our 99.7% resolution rate speaks to the clarity that smart contract milestones provide. Most disputes are resolved within 48 hours.",
  },
  {
    question: 'Can I use GCSC for any type of construction project?',
    answer: 'GCSC supports residential and commercial construction projects of all sizes — from kitchen remodels to full home builds, from office renovations to commercial developments. If it involves construction, GCSC can protect it.',
  },
]

function FAQItem({
  item,
  isOpen,
  onClick,
}: {
  item: typeof faqItems[0]
  isOpen: boolean
  onClick: () => void
}) {
  return (
    <div style={{ borderBottom: '1px solid rgba(15,23,42,0.08)' }}>
      <button
        className="w-full flex items-center justify-between py-6 text-left"
        onClick={onClick}
      >
        <span className="font-outfit font-semibold text-body pr-8" style={{ color: '#0F172A' }}>
          {item.question}
        </span>
        <span
          className="shrink-0 transition-transform duration-300"
          style={{
            color: '#7B2FF7',
            transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
          }}
        >
          <Plus size={20} />
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="overflow-hidden"
          >
            <p
              className="font-inter text-body leading-body pb-6"
              style={{ color: 'rgba(15,23,42,0.7)' }}
            >
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function FAQSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  useGSAP(() => {
    if (!sectionRef.current) return
    const items = sectionRef.current.querySelectorAll('.faq-item')
    gsap.fromTo(
      items,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
      }
    )
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} className="relative w-full" style={{ backgroundColor: '#F1F5F9' }}>
      <div className="mx-auto max-w-container container-padding py-24 lg:py-32">
        {/* Header */}
        <div className="text-center mb-16">
          <SectionLabel text="GOT QUESTIONS?" />
          <h2 className="font-outfit font-bold text-h2 leading-h2 tracking-h2" style={{ color: '#0F172A' }}>
            Frequently Asked Questions
          </h2>
        </div>

        {/* Accordion */}
        <div className="max-w-[800px] mx-auto">
          {faqItems.map((item, index) => (
            <div key={index} className="faq-item">
              <FAQItem
                item={item}
                isOpen={openIndex === index}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════
   SECTION 7 — FINAL CTA BANNER
   ════════════════════════════════════════════ */
function CTASection() {
  const sectionRef = useRef<HTMLElement>(null)

  const particles = useRef(
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 6 + 3,
      duration: Math.random() * 12 + 10,
      delay: Math.random() * 10,
      opacity: Math.random() * 0.05 + 0.05,
    }))
  ).current

  useGSAP(() => {
    if (!sectionRef.current) return
    const items = sectionRef.current.querySelectorAll('.cta-animate')
    gsap.fromTo(
      items,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      }
    )
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden gradient-primary py-24 lg:py-28">
      {/* Floating particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-white pointer-events-none"
          style={{
            left: p.left,
            bottom: '-10%',
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animation: `float-up ${p.duration}s linear ${p.delay}s infinite`,
          }}
        />
      ))}

      <div className="relative z-10 mx-auto max-w-container container-padding text-center">
        <h2 className="cta-animate font-outfit font-bold text-h1 leading-h1 tracking-h1 text-white mb-4">
          Ready to Build with Confidence?
        </h2>
        <p className="cta-animate font-inter text-body-lg leading-body-lg max-w-[640px] mx-auto mb-8" style={{ color: 'rgba(255,255,255,0.85)' }}>
          Join thousands of homeowners and contractors who trust GCSC for secure, transparent construction payments.
        </p>
        <div className="cta-animate">
          <Link
            to="/pricing"
            className="inline-flex items-center justify-center bg-white font-inter font-semibold text-[1rem] px-10 py-4 rounded-full hover:scale-105 transition-all duration-300"
            style={{
              color: '#7B2FF7',
              boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            Get Started for Free
          </Link>
        </div>
        <p className="cta-animate mt-6 font-inter text-body-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
          <span>&#10022;</span> Free to join &middot; No credit card required &middot; Instant setup
        </p>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════
   HOME PAGE — Compose all sections
   ════════════════════════════════════════════ */
export default function HomePage() {
  return (
    <div className="relative">
      <HeroSection />
      <StatsSection />
      <HowItWorksSection />
      <EscrowSimulation />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
    </div>
  )
}
