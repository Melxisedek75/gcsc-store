import { motion } from 'framer-motion'
import {
  Globe, Zap, Shield,
  Lock, Eye, Handshake, Cpu, Users, Rocket,
} from 'lucide-react'

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

function VisionItem({ icon: Icon, title, description }: { icon: typeof Globe; title: string; description: string }) {
  return (
    <motion.div variants={fadeUpChild} className="flex flex-col items-start">
      <Icon size={48} style={{ color: '#00D4FF' }} />
      <h3 className="font-outfit font-semibold text-h3 text-[#0F172A] mt-4">{title}</h3>
      <p className="font-inter text-body text-[#475569] mt-2">{description}</p>
    </motion.div>
  )
}

function ValueCard({
  icon: Icon, title, description,
}: {
  icon: typeof Lock; title: string; description: string
}) {
  return (
    <motion.div
      variants={fadeUpChild}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4, ease: easeSmooth }}
      className="relative bg-white rounded-2xl p-10 overflow-hidden"
      style={{
        boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
        border: '1px solid transparent',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(123,47,247,0.2)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)'
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'transparent'
        ;(e.currentTarget as HTMLElement).style.boxShadow = '0 2px 16px rgba(0,0,0,0.05)'
      }}
    >
      <Icon size={40} style={{ color: '#7B2FF7', marginBottom: '20px' }} />
      <h3 className="font-outfit font-semibold text-h3" style={{ color: '#0F172A' }}>{title}</h3>
      <p className="font-inter text-body mt-3" style={{ color: 'rgba(15,23,42,0.7)' }}>{description}</p>
    </motion.div>
  )
}

const values = [
  { icon: Lock, title: 'Security First', description: 'Every product decision starts with protecting user funds, identity data, and project records.' },
  { icon: Eye, title: 'Transparent Records', description: 'Escrow state, milestone approvals, and payment events should be clear to the parties involved.' },
  { icon: Handshake, title: 'Fairness for Both Sides', description: 'The platform is designed to protect homeowners and contractors through the same milestone rules.' },
  { icon: Cpu, title: 'Practical Technology', description: 'Blockchain, identity, and automation are used only where they solve real construction payment problems.' },
  { icon: Users, title: 'People-Centered Design', description: 'Behind every project is someone trying to build a home, a business, or a more reliable workflow.' },
  { icon: Rocket, title: 'Continuous Improvement', description: 'GCSC will evolve through user feedback, security review, and careful production rollout.' },
]

const visionItems = [
  { icon: Globe, title: 'Accessible Escrow', description: 'Construction escrow should be easier to use for ordinary homeowners and working contractors.' },
  { icon: Zap, title: 'Fast Settlement', description: 'XPR Network makes it possible to design settlement flows with instant finality and zero gas fees for users.' },
  { icon: Shield, title: 'Verifiable Protection', description: 'Milestone records and escrow status should be visible, reviewable, and difficult to manipulate.' },
  { icon: Handshake, title: 'Aligned Incentives', description: 'The platform is built around approved work, clear evidence, and predictable payment release.' },
]

export default function About() {
  return (
    <div className="w-full">
      <section
        className="relative flex items-center justify-center overflow-hidden"
        style={{ height: '60vh', background: '#F8FAFC' }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 20% 40%, rgba(123,47,247,0.12) 0%, transparent 60%),' +
              'radial-gradient(ellipse 60% 50% at 70% 60%, rgba(59,107,247,0.1) 0%, transparent 55%),' +
              'radial-gradient(ellipse 50% 40% at 50% 90%, rgba(0,212,255,0.06) 0%, transparent 50%),' +
              '#F8FAFC',
          }}
        />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUpStagger}
          className="relative z-10 text-center container-padding"
        >
          <SectionLabel text="ABOUT GCSC" />
          <motion.h1
            variants={fadeUpChild}
            className="font-outfit font-bold text-h1 text-[#0F172A]"
          >
            Building Trust, One Block at a Time
          </motion.h1>
          <motion.p
            variants={fadeUpChild}
            className="font-inter text-body-lg mt-6 mx-auto"
            style={{ color: '#475569', maxWidth: '640px' }}
          >
            GCSC was born from a simple idea: construction payments should be as reliable as the buildings they create.
          </motion.p>
        </motion.div>
      </section>

      <section style={{ background: '#F1F5F9', padding: '120px 0' }}>
        <div className="mx-auto max-w-container container-padding">
          <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-16 items-start">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={slideRight}
            >
              <SectionLabel text="OUR STORY" />
              <h2 className="font-outfit font-bold text-h2" style={{ color: '#0F172A' }}>
                Why We Built GCSC
              </h2>
              <div className="flex flex-col gap-5 mt-8">
                <p className="font-inter text-body" style={{ color: 'rgba(15,23,42,0.75)' }}>
                  Construction projects often depend on large upfront payments, unclear progress records, and trust between people who may be working together for the first time.
                </p>
                <p className="font-inter text-body" style={{ color: 'rgba(15,23,42,0.75)' }}>
                  GCSC uses XPR Network smart contracts to make escrow, milestone approval, and payment release easier to verify. The goal is simple: keep funds protected until the agreed work is reviewed.
                </p>
                <p className="font-inter text-body" style={{ color: 'rgba(15,23,42,0.75)' }}>
                  The platform is being built as construction payment infrastructure for homeowners, contractors, and ecosystem partners who need transparent workflows instead of informal promises.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={fadeUpStagger}
              className="glass-card"
              style={{ padding: '40px' }}
            >
              <SectionLabel text="PAYMENT CLARITY" />
              <h3 className="font-outfit font-semibold text-h3" style={{ color: '#0F172A' }}>
                Built Around Milestones
              </h3>
              <p className="font-inter text-body mt-4" style={{ color: 'rgba(15,23,42,0.7)' }}>
                Instead of asking either side to rely on blind trust, GCSC is designed around documented project scopes, escrowed funds, submitted evidence, homeowner review, and clear release events.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section style={{ background: '#F8FAFC', padding: '120px 0' }}>
        <div className="mx-auto max-w-[900px] container-padding text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUpStagger}
          >
            <SectionLabel text="MISSION & VISION" />
            <motion.h2
              variants={fadeUpChild}
              className="font-outfit font-bold text-[#0F172A] mx-auto"
              style={{
                fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                lineHeight: 1.2,
              }}
            >
              To make construction payments transparent, secure, and fair for everyone: homeowners, contractors, and the broader building industry.
            </motion.h2>
          </motion.div>

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
              style={{ color: '#0F172A' }}
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
              <ValueCard key={v.title} {...v} />
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  )
}
