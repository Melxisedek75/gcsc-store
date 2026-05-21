import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Pricing', path: '/pricing' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
  { label: 'Security', path: '/security' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <nav
      className="sticky top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/90 backdrop-blur-xl border-b border-gray-200/50"
    >
      <div className="mx-auto max-w-container container-padding">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0">
            <img
              src="/gcsc-logo-nav.png"
              alt="GCSC Smart Contract"
              className="h-[40px] w-auto object-contain"
              style={{ filter: 'drop-shadow(0 0 8px rgba(123,47,247,0.15))' }}
            />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="relative font-inter font-medium text-nav text-[#475569] hover:text-[#0F172A] transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:block">
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center gradient-primary text-white font-inter font-semibold text-[0.875rem] px-6 py-2.5 rounded-full hover:scale-[1.04] hover:shadow-glow transition-all duration-300"
              style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="lg:hidden relative z-50 w-10 h-10 flex items-center justify-center text-[#0F172A]"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Overlay Menu */}
      <div
        className="lg:hidden fixed inset-0 top-[72px] bg-white transition-all duration-500"
        style={{
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div className="flex flex-col items-center justify-center gap-8 pt-16">
          {navLinks.map((link, index) => (
            <Link
              key={link.path}
              to={link.path}
              className="font-outfit font-semibold text-[1.75rem] text-[#0F172A] hover:text-violet transition-colors duration-200"
              style={{
                opacity: isOpen ? 1 : 0,
                transform: isOpen ? 'translateY(0)' : 'translateY(20px)',
                transition: `all 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.08 + 0.1}s`,
              }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/pricing"
            className="mt-4 inline-flex items-center justify-center gradient-primary text-white font-inter font-semibold text-[1rem] px-8 py-3.5 rounded-full"
            style={{
              opacity: isOpen ? 1 : 0,
              transform: isOpen ? 'translateY(0)' : 'translateY(20px)',
              transition: `all 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${navLinks.length * 0.08 + 0.1}s`,
            }}
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  )
}
