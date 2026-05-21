import { useRef, useState, useEffect } from 'react'
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion'
import {
  Globe, Zap, Shield, TrendingUp,
  Lock, Eye, Handshake, Cpu, Users, Rocket,
  Linkedin, Twitter,
} from 'lucide-react'

/* ── easing tokens ── */
const easeSmooth = [0.16, 1, 0.3, 1] as [number, number, number, number]

const fadeUpStagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
}

const fadeUpChild = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easeSmooth } },
}

const slideRight = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: easeSmooth } },
}

/* ── Section Label (Eyebrow) ── */
function SectionLabel({ text }: { text: string }) {
  return (
    <motion.div
      variants={fadeUpChild}
      className="flex items-center gap-2 mb-4"
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: '#00D4FF' }}
      />
      <span
        className="font-outfit font-semibold text-label uppercase"
        style={{
          color: '#00D4FF',
          letterSpacing: '0.12em',
        }}
      >
        {text}
      </span>
    </motion.div>
  )
}

/* ── Animated counter ── */
function AnimatedCounter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => {
    if (target >= 10) return Math.round(v).toString()
    return v.toFixed(1)
  })
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    if (!isInView) return
    const controls = animate(count, target, {
      duration: 2,
      ease: (t: number) => 1 - (1 - t) * (1 - t),
    })
    return controls.stop
  }, [isInView, target, count])

  useEffect(() => {
    return rounded.on('change', (v) => setDisplay(String(v)))
  }, [rounded])

  return (
    <span ref={ref}>
      {prefix}{display}{suffix}
    </span>
  )
}

/* ── Stat card (glass) ── */
function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <motion.div
      variants={fadeUpChild}
      className="glass-card glass-card-hover transition-all duration-400"
      style={{ padding: '32px', transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
    >
      <div
        className="font-outfit font-bold"
        style={{ fontSize: '4rem', lineHeight: 1, color: '#00D4FF' }}
      >
        {number}
      </div>
      <div className="font-inter text-body-sm text-silver mt-2">{label}</div>
    </motion.div>
  )
}

/* ── Vision item ── */
function VisionItem({ icon: Icon, title, description }: { icon: typeof Globe; title: string; description: string }) {
  return (
    <motion.div variants={fadeUpChild} className="flex flex-col items-start">
      <Icon size={48} style={{ color: '#00D4FF' }} />
      <h3 className="font-outfit font-semibold text-h3 text-white mt-4">{title}</h3>
      <p className="font-inter text-body text-silver mt-2">{description}</p>
    </motion.div>
  )
}

/* ── Value card ── */
function ValueCard({
  num, icon: Icon, title, description,
}: {
  num: string; icon: typeof Lock; title: string; description: string
}) {
  return (
    <motion.div
      variants={fadeUpChild}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4, ease: easeSmooth }}
      className="relative bg-white rounded-2xl p-10 overflow-hidden"
      style={{
        boxShadow: '0 2px 16px rgba(11,14,23,0.05)',
        border: '1px solid transparent',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(123,47,247,0.2)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(11,14,23,0.1)'
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'transparent'
        ;(e.currentTarget as HTMLElement).style.boxShadow = '0 2px 16px rgba(11,14,23,0.05)'
      }}
    >
      <span
        className="absolute top-4 right-5 font-outfit font-bold"
        style={{
          fontSize: '3rem',
          opacity: 0.3,
          background: 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 50%, #00D4FF 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {num}
      </span>
      <Icon size={40} style={{ color: '#7B2FF7', marginBottom: '20px' }} />
      <h3 className="font-outfit font-semibold text-h3" style={{ color: '#0B0E17' }}>{title}</h3>
      <p className="font-inter text-body mt-3" style={{ color: 'rgba(11,14,23,0.7)' }}>{description}</p>
    </motion.div>
  )
}

/* ── Team member ── */
function TeamCard({
  name, role, bio, image,
}: {
  name: string; role: string; bio: string; image?: string
}) {
  const initials = name.split(' ').map(n => n[0]).join('')
  return (
    <motion.div
      variants={fadeUpChild}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.4, ease: easeSmooth }}
      className="bg-white rounded-[20px] overflow-hidden"
      style={{ boxShadow: '0 4px 24px rgba(11,14,23,0.06)' }}
    >
      <div
        className="flex items-center justify-center relative"
        style={{ height: '280px', background: '#0B0E17' }}
      >
        {image ? (
          <div
            className="w-[160px] h-[160px] rounded-full overflow-hidden"
            style={{
              border: '3px solid transparent',
              background: 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 50%, #00D4FF 100%)',
              padding: '3px',
            }}
          >
            <img
              src={image}
              alt={name}
              className="w-full h-full rounded-full object-cover"
              style={{ background: '#0B0E17' }}
            />
          </div>
        ) : (
          <div
            className="w-[160px] h-[160px] rounded-full flex items-center justify-center font-outfit font-bold text-[3rem]"
            style={{
              background: 'linear-gradient(135deg, #151928 0%, #0B0E17 100%)',
              border: '3px solid transparent',
              backgroundClip: 'padding-box',
              color: '#F8FAFF',
              boxShadow: 'inset 0 0 40px rgba(123,47,247,0.15)',
            }}
          >
            {initials}
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="font-outfit font-semibold text-h3" style={{ color: '#0B0E17' }}>{name}</h3>
        <p className="font-inter font-medium text-body-sm mt-1" style={{ color: '#7B2FF7' }}>{role}</p>
        <p className="font-inter text-body-sm mt-2 line-clamp-2" style={{ color: 'rgba(11,14,23,0.65)' }}>{bio}</p>
        <div className="flex items-center gap-3 mt-4">
          <a href="#" className="text-silver hover:text-violet transition-colors duration-200">
            <Linkedin size={20} />
          </a>
          <a href="#" className="text-silver hover:text-violet transition-colors duration-200">
            <Twitter size={20} />
          </a>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Timeline milestone ── */
function TimelineMilestone({
  date, title, description, index,
}: {
  date: string; title: string; description: string; index: number
}) {
  const isLeft = index % 2 === 0
  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: easeSmooth }}
      className="relative flex items-center"
      style={{
        flexDirection: isLeft ? 'row' : 'row-reverse',
        gap: '24px',
      }}
    >
      {/* Card side */}
      <div className="flex-1 flex" style={{ justifyContent: isLeft ? 'flex-end' : 'flex-start' }}>
        <div
          className="glass-card"
          style={{ padding: '24px 32px', maxWidth: '340px', width: '100%' }}
        >
          <span className="font-outfit font-bold text-label" style={{ color: '#00D4FF', letterSpacing: '0.08em' }}>
            {date}
          </span>
          <h3 className="font-outfit font-semibold text-h3 text-white mt-2">{title}</h3>
          <p className="font-inter text-body text-silver mt-2">{description}</p>
        </div>
      </div>

      {/* Dot */}
      <div
        className="w-4 h-4 rounded-full shrink-0 relative z-10"
        style={{
          background: 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 50%, #00D4FF 100%)',
          boxShadow: '0 0 12px rgba(123,47,247,0.4)',
        }}
      />

      {/* Empty side */}
      <div className="flex-1" />
    </motion.div>
  )
}

/* ═════════════════════════════════════════════════════════════════
   About Page
   ═════════════════════════════════════════════════════════════════ */

const teamMembers = [
  { name: 'James Rodriguez', role: 'Founder & CEO', bio: 'Former construction project manager turned blockchain advocate. Built GCSC after experiencing payment fraud firsthand.', image: '/team-ceo.jpg' },
  { name: 'Aisha Patel', role: 'Chief Technology Officer', bio: '10+ years in distributed systems and smart contract development. Previously led engineering at a DeFi protocol.', image: '/team-cto.jpg' },
  { name: 'Marcus Chen', role: 'Chief Operating Officer', bio: 'Operations expert with a background in scaling marketplace platforms. Ex-Uber, ex-Angi.', image: '/team-coo.jpg' },
  { name: 'Elena Volkov', role: 'Head of Security', bio: 'Cybersecurity specialist with prior experience at a major blockchain security firm. CISSP, OSCP certified.' },
  { name: 'David Okafor', role: 'Lead Smart Contract Engineer', bio: 'Smart contract architect with 5+ years on EOSIO chains. Audited 200+ contracts before joining GCSC.' },
  { name: 'Sarah Kim', role: 'Head of Product', bio: 'Product designer and strategist passionate about making complex technology accessible to everyday users.' },
]

const values = [
  { num: '01', icon: Lock, title: 'Security First', description: 'We never compromise on security. Every line of code, every transaction, every architectural decision prioritizes the safety of our users\' funds and data.' },
  { num: '02', icon: Eye, title: 'Radical Transparency', description: 'We believe in showing our work. Every escrow transaction is visible on-chain. Our fee structure has no fine print. Trust is built through clarity.' },
  { num: '03', icon: Handshake, title: 'Fairness for All', description: 'Our platform protects both sides equally. We don\'t favor homeowners over contractors or vice versa. Smart contracts enforce fairness automatically.' },
  { num: '04', icon: Cpu, title: 'Technology-Forward', description: 'We embrace emerging technology that solves real problems. Blockchain isn\'t a buzzword for us \u2014 it\'s the foundation of trustless escrow.' },
  { num: '05', icon: Users, title: 'People-Centered', description: 'Behind every transaction is a person building their dream home or growing their business. We design for humans, not just wallets.' },
  { num: '06', icon: Rocket, title: 'Relentless Improvement', description: 'We\'re never satisfied with "good enough." We ship constantly, listen to feedback obsessively, and push the industry forward.' },
]

const visionItems = [
  { icon: Globe, title: 'Global Access', description: 'Construction escrow should be available to every homeowner and contractor on Earth, not just those in wealthy markets.' },
  { icon: Zap, title: 'Instant Trust', description: 'We believe trust shouldn\'t require months of relationship-building. Smart contracts create instant, verifiable trust.' },
  { icon: Shield, title: 'Uncompromising Security', description: 'Every dollar protected by military-grade encryption and immutable blockchain records. Security is never optional.' },
  { icon: TrendingUp, title: 'Industry Transformation', description: 'We\'re not just a payment tool \u2014 we\'re building the infrastructure that will modernize the entire construction economy.' },
]

const milestones = [
  { date: 'Q1 2023', title: 'The Spark', description: 'Founder James Rodriguez loses $40K to a fraudulent contractor. The idea for blockchain-protected construction payments is born.' },
  { date: 'Q3 2023', title: 'Prototype Built', description: 'First smart contract escrow prototype deployed on XPR Network testnet. Core team of 4 assembled.' },
  { date: 'Q1 2024', title: 'GCSC Launches', description: 'Public beta goes live with 50 initial contractors and 120 projects in the first month.' },
  { date: 'Q2 2024', title: '$1M Secured', description: 'Platform surpasses $1 million in escrow-secured payments. First enterprise client signed.' },
  { date: 'Q4 2024', title: 'Mobile App Released', description: 'Native iOS and Android apps launch, bringing escrow management to job sites.' },
  { date: 'Q1 2025', title: 'Global Expansion', description: 'GCSC expands to 12 countries. Multi-language support added. $10M milestone reached.' },
  { date: 'Q2 2025', title: 'AI Matching', description: 'AI-powered contractor-homeowner matching system deployed, improving match quality by 65%.' },
]

export default function About() {
  return (
    <div className="w-full">
      {/* ── Section 1: Page Hero ── */}
      <section
        className="relative flex items-center justify-center overflow-hidden"
        style={{ height: '60vh', background: '#0B0E17' }}
      >
        {/* Mesh gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 20% 40%, rgba(123,47,247,0.18) 0%, transparent 60%),' +
              'radial-gradient(ellipse 60% 50% at 70% 60%, rgba(59,107,247,0.15) 0%, transparent 55%),' +
              'radial-gradient(ellipse 50% 40% at 50% 90%, rgba(0,212,255,0.12) 0%, transparent 50%),' +
              '#0B0E17',
          }}
        />
        <motion.div
          variants={fadeUpStagger}
          initial="hidden"
          animate="visible"
          className="relative z-10 text-center max-w-[800px] mx-auto container-padding"
        >
          <SectionLabel text="OUR STORY" />
          <motion.h1
            variants={fadeUpChild}
            className="font-outfit font-bold text-h1 text-white"
          >
            Building Trust, One Block at a Time
          </motion.h1>
          <motion.p
            variants={fadeUpChild}
            className="font-inter text-body-lg text-silver mt-6 mx-auto"
            style={{ maxWidth: '640px' }}
          >
            GCSC was born from a simple idea: construction payments should be as reliable as the buildings they create.
          </motion.p>
        </motion.div>
      </section>

      {/* ── Section 2: Our Story ── */}
      <section style={{ background: '#F1F5F9', padding: '120px 0' }}>
        <div className="mx-auto max-w-container container-padding">
          <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-16 items-start">
            {/* Left — Story text */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={slideRight}
            >
              <SectionLabel text="THE BEGINNING" />
              <h2 className="font-outfit font-bold text-h2" style={{ color: '#0B0E17' }}>
                Why We Built GCSC
              </h2>
              <div className="flex flex-col gap-5 mt-8">
                <p className="font-inter text-body" style={{ color: 'rgba(11,14,23,0.75)' }}>
                  In 2023, our founder watched a close friend lose $40,000 to a contractor who vanished halfway through a home renovation. The contractor had been paid upfront. There was no escrow. No protection. Just gone.
                </p>
                <p className="font-inter text-body" style={{ color: 'rgba(11,14,23,0.75)' }}>
                  That same week, we discovered the XPR Network — a blockchain with instant transactions, zero gas fees, and smart contract capabilities perfect for real-world use cases. The idea clicked immediately: what if every construction payment was protected by an unbreakable smart contract?
                </p>
                <p className="font-inter text-body" style={{ color: 'rgba(11,14,23,0.75)' }}>
                  GCSC launched in 2024 as the world's first construction marketplace built entirely on blockchain escrow. Today, we protect millions in construction payments across thousands of projects, and we're just getting started.
                </p>
              </div>
            </motion.div>

            {/* Right — Stat cards */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={fadeUpStagger}
              className="flex flex-col gap-4"
              style={{ paddingTop: '40px' }}
            >
              <div className="lg:ml-8">
                <StatCard number="2024" label="Year Founded" />
              </div>
              <div className="lg:ml-0">
                <StatCard number="3+" label="Years of Innovation" />
              </div>
              <div className="lg:ml-4">
                <StatCard number="12" label="Countries Served" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Section 3: Mission & Vision ── */}
      <section style={{ background: '#0B0E17', padding: '120px 0' }}>
        <div className="mx-auto max-w-[900px] container-padding text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUpStagger}
          >
            <SectionLabel text="OUR MISSION" />
            <motion.h2
              variants={fadeUpChild}
              className="font-outfit font-bold text-white mx-auto"
              style={{
                fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                lineHeight: 1.2,
              }}
            >
              To make construction payments transparent, secure, and fair for everyone — homeowners, contractors, and the entire building industry.
            </motion.h2>
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 1, ease: easeSmooth }}
            className="mx-auto my-12"
            style={{
              width: '200px',
              height: '2px',
              background: 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 50%, #00D4FF 100%)',
            }}
          />

          {/* Vision grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUpStagger}
            className="grid grid-cols-1 sm:grid-cols-2 gap-12 text-left"
          >
            {visionItems.map((item) => (
              <VisionItem key={item.title} {...item} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Section 4: Core Values ── */}
      <section style={{ background: '#E2E8F0', padding: '120px 0' }}>
        <div className="mx-auto max-w-container container-padding">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUpStagger}
            className="text-center mb-16"
          >
            <SectionLabel text="WHAT WE BELIEVE" />
            <motion.h2
              variants={fadeUpChild}
              className="font-outfit font-bold text-h2"
              style={{ color: '#0B0E17' }}
            >
              Our Core Values
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUpStagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {values.map((v) => (
              <ValueCard key={v.num} {...v} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Section 5: Team ── */}
      <section style={{ background: '#F1F5F9', padding: '120px 0' }}>
        <div className="mx-auto max-w-[1000px] container-padding">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUpStagger}
            className="text-center mb-16"
          >
            <SectionLabel text="THE PEOPLE" />
            <motion.h2 variants={fadeUpChild} className="font-outfit font-bold text-h2" style={{ color: '#0B0E17' }}>
              Meet the Team
            </motion.h2>
            <motion.p
              variants={fadeUpChild}
              className="font-inter text-body-lg mt-3 mx-auto"
              style={{ color: 'rgba(11,14,23,0.6)', maxWidth: '640px' }}
            >
              Builders, engineers, and dreamers united by a mission to transform construction payments.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUpStagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {teamMembers.map((member) => (
              <TeamCard key={member.name} {...member} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Section 6: Company Timeline ── */}
      <section style={{ background: '#0B0E17', padding: '120px 0' }}>
        <div className="mx-auto max-w-container container-padding">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUpStagger}
            className="text-center mb-16"
          >
            <SectionLabel text="OUR JOURNEY" />
            <motion.h2 variants={fadeUpChild} className="font-outfit font-bold text-h2 text-white">
              Key Milestones
            </motion.h2>
          </motion.div>

          {/* Timeline */}
          <div className="relative mx-auto" style={{ maxWidth: '800px' }}>
            {/* Center line */}
            <div
              className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 hidden lg:block"
              style={{
                background: 'linear-gradient(180deg, #7B2FF7 0%, #3B6BF7 50%, #00D4FF 100%)',
              }}
            />
            {/* Mobile line */}
            <div
              className="absolute left-2 top-0 bottom-0 w-0.5 lg:hidden"
              style={{
                background: 'linear-gradient(180deg, #7B2FF7 0%, #3B6BF7 50%, #00D4FF 100%)',
              }}
            />

            <div className="flex flex-col gap-12">
              {milestones.map((m, i) => (
                <div key={m.date} className="hidden lg:block">
                  <TimelineMilestone {...m} index={i} />
                </div>
              ))}
              {/* Mobile timeline */}
              {milestones.map((m, i) => (
                <motion.div
                  key={`mobile-${m.date}`}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease: easeSmooth }}
                  className="lg:hidden relative pl-10"
                >
                  <div
                    className="absolute left-2 top-6 w-3 h-3 rounded-full -translate-x-1/2"
                    style={{
                      background: 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 50%, #00D4FF 100%)',
                      boxShadow: '0 0 12px rgba(123,47,247,0.4)',
                    }}
                  />
                  <div className="glass-card" style={{ padding: '20px 24px' }}>
                    <span className="font-outfit font-bold text-label" style={{ color: '#00D4FF' }}>{m.date}</span>
                    <h3 className="font-outfit font-semibold text-h3 text-white mt-1">{m.title}</h3>
                    <p className="font-inter text-body-sm text-silver mt-1">{m.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 7: Stats Bar ── */}
      <section
        className="gradient-primary"
        style={{ padding: '60px 0' }}
      >
        <div className="mx-auto max-w-container container-padding">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeUpStagger}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center"
          >
            {[
              { num: 12, suffix: '', label: 'Countries' },
              { num: 50, suffix: 'M+', prefix: '$', label: 'Secured' },
              { num: 50, suffix: '+', label: 'Team Members' },
              { num: 99.7, suffix: '%', label: 'Satisfaction' },
            ].map((stat) => (
              <motion.div key={stat.label} variants={fadeUpChild}>
                <div className="font-outfit font-bold text-stat text-white">
                  <AnimatedCounter target={stat.num} suffix={stat.suffix} prefix={stat.prefix} />
                </div>
                <div className="font-inter text-body mt-1" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  )
}
