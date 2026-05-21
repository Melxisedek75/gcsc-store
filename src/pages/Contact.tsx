import { useState } from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import {
  Mail, Phone, MessageCircle, MapPin,
  HelpCircle, MessageSquare, Video, Bug,
  Loader2, CheckCircle,
  Twitter, Linkedin, MessageCircle as DiscordIcon, Github,
  ArrowRight,
} from 'lucide-react'

/* ── easing tokens ── */
const easeSmooth = [0.16, 1, 0.3, 1] as [number, number, number, number]
const easeSpring = [0.34, 1.56, 0.64, 1] as [number, number, number, number]

/* ── variants ── */
const fadeUpStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const fadeUpChild = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easeSmooth } },
}

/* ── Section Label (Eyebrow) ── */
function SectionLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#00D4FF' }} />
      <span
        className="font-outfit font-semibold text-label uppercase"
        style={{ color: '#00D4FF', letterSpacing: '0.12em' }}
      >
        {text}
      </span>
    </div>
  )
}

/* ── Info Card ── */
function InfoCard({
  icon: Icon, title, detail, secondary, badge,
}: {
  icon: typeof Mail; title: string; detail: string; secondary?: string; badge?: { text: string; color: string }
}) {
  return (
    <motion.div
      variants={fadeUpChild}
      className="flex items-start gap-4"
    >
      <div
        className="flex items-center justify-center rounded-full shrink-0"
        style={{ width: '40px', height: '40px', background: 'rgba(123,47,247,0.08)' }}
      >
        <Icon size={24} style={{ color: '#7B2FF7' }} />
      </div>
      <div>
        <h4 className="font-outfit font-semibold text-body" style={{ color: '#0B0E17' }}>{title}</h4>
        <p className="font-inter text-body-sm text-silver">{detail}</p>
        {secondary && <p className="font-inter text-body-sm text-silver">{secondary}</p>}
        {badge && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: badge.color }} />
            <span className="font-inter text-body-sm" style={{ color: badge.color }}>{badge.text}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

/* ── Support Channel Card ── */
function ChannelCard({
  icon: Icon, iconBg, iconColor, title, description, cta,
}: {
  icon: typeof HelpCircle; iconBg: string; iconColor: string; title: string; description: string; cta: string
}) {
  return (
    <motion.div
      variants={fadeUpChild}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4, ease: easeSmooth }}
      className="bg-white rounded-2xl p-8 text-center flex flex-col items-center"
      style={{
        boxShadow: '0 2px 16px rgba(11,14,23,0.05)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(11,14,23,0.1)'
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 16px rgba(11,14,23,0.05)'
      }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ background: iconBg }}
      >
        <Icon size={28} style={{ color: iconColor }} />
      </div>
      <h3 className="font-outfit font-semibold text-h3" style={{ color: '#0B0E17' }}>{title}</h3>
      <p className="font-inter text-body-sm mt-2" style={{ color: 'rgba(11,14,23,0.65)' }}>{description}</p>
      <span
        className="inline-flex items-center gap-1 font-inter font-semibold text-body-sm mt-4 cursor-pointer hover:underline"
        style={{ color: '#7B2FF7' }}
      >
        {cta} <ArrowRight size={14} />
      </span>
    </motion.div>
  )
}

/* ═════════════════════════════════════════════════════════════════
   Contact Page
   ═════════════════════════════════════════════════════════════════ */

const socialIcons = [
  { icon: Twitter, label: 'Twitter/X' },
  { icon: Linkedin, label: 'LinkedIn' },
  { icon: DiscordIcon, label: 'Discord' },
  { icon: Github, label: 'GitHub' },
]

const channels = [
  {
    icon: HelpCircle, iconBg: 'rgba(123,47,247,0.1)', iconColor: '#7B2FF7',
    title: 'Help Center', description: 'Browse our comprehensive knowledge base with guides, tutorials, and troubleshooting articles.', cta: 'Visit Help Center',
  },
  {
    icon: MessageSquare, iconBg: 'rgba(59,107,247,0.1)', iconColor: '#3B6BF7',
    title: 'Community Forum', description: 'Join our community of homeowners and contractors. Ask questions, share experiences, get advice.', cta: 'Join the Forum',
  },
  {
    icon: Video, iconBg: 'rgba(0,212,255,0.1)', iconColor: '#00D4FF',
    title: 'Video Tutorials', description: 'Watch step-by-step video guides on using GCSC, from account setup to releasing escrow payments.', cta: 'Watch Tutorials',
  },
  {
    icon: Bug, iconBg: 'rgba(245,158,11,0.1)', iconColor: '#F59E0B',
    title: 'Report an Issue', description: 'Found a bug or have a feature request? Submit it directly to our engineering team.', cta: 'Submit a Report',
  },
]

const selectOptions = [
  'Select your role',
  'Homeowner',
  'Contractor',
  'Enterprise / Developer',
  'Partner / Investor',
  'Other',
]

export default function Contact() {
  const [formState, setFormState] = useState<'idle' | 'loading' | 'success'>('idle')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: '',
    subject: '',
    message: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email'
    if (!formData.role || formData.role === 'Select your role') newErrors.role = 'Please select your role'
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required'
    if (!formData.message.trim()) newErrors.message = 'Message is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setFormState('loading')
    // Simulate form submission
    setTimeout(() => {
      setFormState('success')
    }, 1500)
  }

  const inputStyle = {
    background: 'rgba(11,14,23,0.02)',
    border: '1px solid rgba(11,14,23,0.1)',
    borderRadius: '12px',
    padding: '14px 16px',
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: '1rem',
    color: '#0B0E17',
    outline: 'none',
    width: '100%',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }

  return (
    <div className="w-full">
      {/* ── Section 1: Page Hero ── */}
      <section
        className="relative flex items-center justify-center overflow-hidden"
        style={{ height: '45vh', background: '#0B0E17' }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 20% 40%, rgba(123,47,247,0.16) 0%, transparent 60%),' +
              'radial-gradient(ellipse 60% 50% at 70% 60%, rgba(59,107,247,0.13) 0%, transparent 55%),' +
              'radial-gradient(ellipse 50% 40% at 50% 90%, rgba(0,212,255,0.1) 0%, transparent 50%),' +
              '#0B0E17',
          }}
        />
        <motion.div
          variants={fadeUpStagger}
          initial="hidden"
          animate="visible"
          className="relative z-10 text-center max-w-[700px] mx-auto container-padding"
        >
          <SectionLabel text="GET IN TOUCH" />
          <motion.h1 variants={fadeUpChild} className="font-outfit font-bold text-h1 text-white">
            We're Here to Help
          </motion.h1>
          <motion.p
            variants={fadeUpChild}
            className="font-inter text-body-lg text-silver mt-6 mx-auto"
            style={{ maxWidth: '560px' }}
          >
            Whether you're a homeowner starting a project, a contractor joining our network, or an enterprise exploring a partnership — we'd love to hear from you.
          </motion.p>
        </motion.div>
      </section>

      {/* ── Section 2: Contact Form + Info ── */}
      <section style={{ background: '#F1F5F9', padding: '100px 0' }}>
        <div className="mx-auto container-padding" style={{ maxWidth: '1100px' }}>
          <div className="grid grid-cols-1 lg:grid-cols-[58%_42%] gap-12">
            {/* Left — Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, ease: easeSmooth }}
            >
              {formState === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: easeSmooth }}
                  className="bg-white rounded-[20px] flex flex-col items-center justify-center text-center"
                  style={{ boxShadow: '0 4px 32px rgba(11,14,23,0.08)', padding: '64px 48px', minHeight: '500px' }}
                >
                  <CheckCircle size={48} style={{ color: '#10B981' }} />
                  <h3 className="font-outfit font-semibold text-h3 mt-6" style={{ color: '#0B0E17' }}>Message Sent!</h3>
                  <p className="font-inter text-body text-silver mt-2">We'll get back to you within 24 hours.</p>
                </motion.div>
              ) : (
                <div
                  className="bg-white rounded-[20px]"
                  style={{ boxShadow: '0 4px 32px rgba(11,14,23,0.08)', padding: '48px' }}
                >
                  <h3 className="font-outfit font-semibold text-h3" style={{ color: '#0B0E17' }}>Send Us a Message</h3>
                  <p className="font-inter text-body-sm text-silver mt-1">Fill out the form below and our team will respond within 24 hours.</p>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-8">
                    {/* Full Name */}
                    <div>
                      <label className="font-outfit font-medium text-body-sm block mb-1.5" style={{ color: '#0B0E17' }}>
                        Full Name <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Your full name"
                        value={formData.fullName}
                        onChange={(e) => handleChange('fullName', e.target.value)}
                        className="focus:border-violet focus:shadow-[0_0_0_3px_rgba(123,47,247,0.1)]"
                        style={inputStyle}
                      />
                      {errors.fullName && <p className="font-inter text-body-sm mt-1" style={{ color: '#EF4444' }}>{errors.fullName}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="font-outfit font-medium text-body-sm block mb-1.5" style={{ color: '#0B0E17' }}>
                        Email Address <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="focus:border-violet focus:shadow-[0_0_0_3px_rgba(123,47,247,0.1)]"
                        style={inputStyle}
                      />
                      {errors.email && <p className="font-inter text-body-sm mt-1" style={{ color: '#EF4444' }}>{errors.email}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="font-outfit font-medium text-body-sm block mb-1.5" style={{ color: '#0B0E17' }}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className="focus:border-violet focus:shadow-[0_0_0_3px_rgba(123,47,247,0.1)]"
                        style={inputStyle}
                      />
                    </div>

                    {/* Role */}
                    <div>
                      <label className="font-outfit font-medium text-body-sm block mb-1.5" style={{ color: '#0B0E17' }}>
                        I am a... <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => handleChange('role', e.target.value)}
                        className="focus:border-violet focus:shadow-[0_0_0_3px_rgba(123,47,247,0.1)] appearance-none cursor-pointer"
                        style={inputStyle}
                      >
                        {selectOptions.map((opt) => (
                          <option key={opt} value={opt === 'Select your role' ? '' : opt}>{opt}</option>
                        ))}
                      </select>
                      {errors.role && <p className="font-inter text-body-sm mt-1" style={{ color: '#EF4444' }}>{errors.role}</p>}
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="font-outfit font-medium text-body-sm block mb-1.5" style={{ color: '#0B0E17' }}>
                        Subject <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="How can we help?"
                        value={formData.subject}
                        onChange={(e) => handleChange('subject', e.target.value)}
                        className="focus:border-violet focus:shadow-[0_0_0_3px_rgba(123,47,247,0.1)]"
                        style={inputStyle}
                      />
                      {errors.subject && <p className="font-inter text-body-sm mt-1" style={{ color: '#EF4444' }}>{errors.subject}</p>}
                    </div>

                    {/* Message */}
                    <div>
                      <label className="font-outfit font-medium text-body-sm block mb-1.5" style={{ color: '#0B0E17' }}>
                        Message <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <textarea
                        rows={5}
                        placeholder="Tell us about your project or question..."
                        value={formData.message}
                        onChange={(e) => handleChange('message', e.target.value)}
                        className="focus:border-violet focus:shadow-[0_0_0_3px_rgba(123,47,247,0.1)] resize-none"
                        style={inputStyle}
                      />
                      {errors.message && <p className="font-inter text-body-sm mt-1" style={{ color: '#EF4444' }}>{errors.message}</p>}
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={formState === 'loading'}
                      className="w-full font-inter font-semibold text-[0.9375rem] text-white rounded-full flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:hover:scale-100"
                      style={{
                        background: 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 50%, #00D4FF 100%)',
                        padding: '16px',
                        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    >
                      {formState === 'loading' ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Send Message'
                      )}
                    </button>
                    <p className="font-inter text-body-sm text-silver text-center flex items-center justify-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      Your information is encrypted and never shared.
                    </p>
                  </form>
                </div>
              )}
            </motion.div>

            {/* Right — Contact Info Sidebar */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={fadeUpStagger}
              className="flex flex-col gap-6 lg:pl-10"
            >
              <InfoCard
                icon={Mail}
                title="Email Us"
                detail="support@gcsc.store"
                secondary="sales@gcsc.store"
              />
              <InfoCard
                icon={Phone}
                title="Call Us"
                detail="+1 (888) 555-GCSC"
                secondary="Mon–Fri, 9AM–6PM EST"
              />
              <InfoCard
                icon={MessageCircle}
                title="Live Chat"
                detail="Available on web and mobile app"
                secondary="Avg. response: 2 minutes"
                badge={{ text: 'Online now', color: '#10B981' }}
              />
              <InfoCard
                icon={MapPin}
                title="Headquarters"
                detail="1200 Brickell Avenue, Suite 400"
                secondary="Miami, FL 33131, USA"
              />

              {/* Social Links */}
              <motion.div variants={fadeUpChild} className="mt-2">
                <h4 className="font-outfit font-semibold text-body mb-3" style={{ color: '#0B0E17' }}>Follow Us</h4>
                <div className="flex items-center gap-3">
                  {socialIcons.map((social) => (
                    <a
                      key={social.label}
                      href="#"
                      aria-label={social.label}
                      className="flex items-center justify-center rounded-full text-silver hover:text-violet transition-all duration-200 hover:scale-110"
                      style={{
                        width: '40px',
                        height: '40px',
                        border: '1px solid rgba(11,14,23,0.1)',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = '#7B2FF7'
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(11,14,23,0.1)'
                      }}
                    >
                      <social.icon size={20} />
                    </a>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Section 3: Support Channels ── */}
      <section style={{ background: '#E2E8F0', padding: '100px 0' }}>
        <div className="mx-auto max-w-container container-padding">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUpStagger}
            className="text-center mb-12"
          >
            <SectionLabel text="MULTIPLE WAYS TO REACH US" />
            <motion.h2 variants={fadeUpChild} className="font-outfit font-bold text-h2" style={{ color: '#0B0E17' }}>
              Choose Your Support Channel
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUpStagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {channels.map((ch) => (
              <ChannelCard key={ch.title} {...ch} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Section 4: Map / Location ── */}
      <section className="relative overflow-hidden" style={{ height: '400px' }}>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 1, ease: easeSmooth }}
          className="absolute inset-0"
        >
          <img
            src="/contact-map-bg.jpg"
            alt="Map showing GCSC headquarters location"
            className="w-full h-full object-cover"
          />
          {/* Dark overlay for readability */}
          <div className="absolute inset-0" style={{ background: 'rgba(11,14,23,0.3)' }} />
          {/* Bottom fade into next section */}
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{
              height: '120px',
              background: 'linear-gradient(to bottom, transparent 0%, #0B0E17 100%)',
            }}
          />
        </motion.div>

        {/* Map Pin + Info Card */}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8, delay: 0.5, ease: easeSpring }}
          className="absolute left-1/2 top-1/3 -translate-x-1/2 z-10"
        >
          {/* Pin */}
          <div className="flex flex-col items-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 50%, #00D4FF 100%)',
                boxShadow: '0 0 24px rgba(123,47,247,0.5)',
              }}
            >
              <MapPin size={24} className="text-white" />
            </div>
            <div
              className="w-0.5 h-8"
              style={{
                background: 'linear-gradient(180deg, rgba(123,47,247,0.5) 0%, transparent 100%)',
              }}
            />
          </div>

          {/* Info Card */}
          <div
            className="glass-card mt-2"
            style={{ padding: '20px 24px', minWidth: '220px', textAlign: 'center' }}
          >
            <h4 className="font-outfit font-semibold text-body text-white">GCSC Headquarters</h4>
            <p className="font-inter text-body-sm text-silver mt-1">1200 Brickell Avenue, Suite 400</p>
            <p className="font-inter text-body-sm text-silver">Miami, FL 33131</p>
            <a
              href="https://maps.google.com/?q=1200+Brickell+Avenue+Miami+FL"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-inter font-semibold text-body-sm mt-2 hover:underline"
              style={{ color: '#7B2FF7' }}
            >
              Get Directions <ArrowRight size={12} />
            </a>
          </div>
        </motion.div>
      </section>

      {/* ── Section 5: Final CTA ── */}
      <section style={{ background: '#0B0E17', padding: '100px 0' }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeUpStagger}
          className="mx-auto max-w-[700px] container-padding text-center"
        >
          <motion.h2 variants={fadeUpChild} className="font-outfit font-bold text-h2 text-white">
            Prefer to Start Right Away?
          </motion.h2>
          <motion.p
            variants={fadeUpChild}
            className="font-inter text-body-lg text-silver mt-4"
          >
            Create your free GCSC account in under 2 minutes and start protecting your construction payments today.
          </motion.p>
          <motion.div
            variants={fadeUpChild}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
          >
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center font-inter font-semibold text-[0.9375rem] text-white rounded-full hover:scale-[1.04] hover:shadow-glow transition-all duration-300 active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 50%, #00D4FF 100%)',
                padding: '14px 32px',
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              Create Free Account
            </Link>
            <Link
              to="/security"
              className="inline-flex items-center justify-center font-inter font-semibold text-[0.9375rem] text-white rounded-full hover:bg-[rgba(123,47,247,0.1)] transition-all duration-300"
              style={{
                border: '1px solid rgba(123,47,247,0.4)',
                padding: '14px 32px',
              }}
            >
              View Our Security
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  )
}
