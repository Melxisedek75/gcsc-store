import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router'
import { Loader2 } from 'lucide-react'
import Layout from './components/Layout'
import Home from './pages/Home'

const Pricing = lazy(() => import('./pages/Pricing'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const Security = lazy(() => import('./pages/Security'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Token = lazy(() => import('./pages/Token'))
const Wallet = lazy(() => import('./pages/Wallet'))
const ContractorProfile = lazy(() => import('./pages/ContractorProfile'))

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center text-[#7B2FF7]">
      <Loader2 size={22} className="animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/security" element={<Security />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/contractors/:id" element={<ContractorProfile />} />
          <Route path="/token" element={<Token />} />
          <Route path="/wallet" element={<Wallet />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}
