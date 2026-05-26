import { Routes, Route } from 'react-router'
import Layout from './components/Layout'
import Home from './pages/Home'
import Pricing from './pages/Pricing'
import About from './pages/About'
import Contact from './pages/Contact'
import Security from './pages/Security'
import Dashboard from './pages/Dashboard'
import Token from './pages/Token'
import Wallet from './pages/Wallet'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/security" element={<Security />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/token" element={<Token />} />
        <Route path="/wallet" element={<Wallet />} />
      </Routes>
    </Layout>
  )
}
