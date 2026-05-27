// GCSC API Client
const API_BASE = import.meta.env.VITE_API_URL || 'https://gcsc-backend-production.up.railway.app/api'

export interface GcscProfile {
  accountType: 'homeowner' | 'contractor'
  companyName?: string
  businessName?: string
  ein?: string
  licenseNumber?: string
  serviceArea?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  specialties?: string[]
  yearsInBusiness?: string
  website?: string
  bio?: string
  logoDataUrl?: string
  projectNeeds?: string
  propertyAddress?: string
  propertyType?: string
  budgetRange?: string
}

export interface GcscWallet {
  accountName: string
  permission: string
  publicKey?: string
  walletType: string
  connectedAt?: string
}

export interface GcscUser {
  id: number
  email: string
  role: 'homeowner' | 'contractor'
  full_name: string
  fullName?: string
  phone?: string
  profile?: GcscProfile
  wallet?: GcscWallet | null
}

export interface GcscProject {
  id: number
  homeowner_id: number
  title: string
  description: string
  category: string
  budget_min: number
  budget_max: number
  location: string
  timeline_days: number
  status: string
  escrow_id?: number | null
  created_at: string
}

export interface GcscBid {
  id: number
  project_id: number
  contractor_id: number
  amount: number
  proposed_timeline_days: number
  message?: string
  status: string
  created_at: string
}

export interface GcscEscrow {
  id: number
  project_id: number
  homeowner_id: number
  contractor_id: number
  total_amount: number
  status: string
  created_at: string
}

export interface GcscMilestone {
  id: number
  escrow_id: number
  title: string
  description: string
  amount: number
  status: string
  verified_by?: string
  created_at: string
  updated_at?: string
}

class ApiClient {
  private token: string | null = null

  constructor() {
    this.token = localStorage.getItem('gcsc_auth_token')
  }

  setToken(token: string) {
    this.token = token
    localStorage.setItem('gcsc_auth_token', token)
  }

  clearToken() {
    this.token = null
    localStorage.removeItem('gcsc_auth_token')
  }

  private async request(path: string, options: RequestInit = {}) {
    const url = `${API_BASE}${path}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>
    }
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`

    const res = await fetch(url, { ...options, headers })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || `API error: ${res.status}`)
    return data
  }

  // AUTH
  register(body: { email: string; password: string; role: string; fullName: string; phone?: string }) {
    return this.request('/auth/register', { method: 'POST', body: JSON.stringify(body) })
  }
  login(body: { email: string; password: string }) {
    return this.request('/auth/login', { method: 'POST', body: JSON.stringify(body) })
  }
  getProfile() {
    return this.request('/auth/profile')
  }
  updateProfile(body: Partial<GcscProfile> & { fullName?: string; full_name?: string; phone?: string }) {
    return this.request('/auth/profile', { method: 'PUT', body: JSON.stringify(body) })
  }
  logout() {
    this.clearToken()
  }

  // PROJECTS
  getProjects(filters?: Record<string, string>) {
    const qs = filters ? '?' + new URLSearchParams(filters) : ''
    return this.request(`/projects${qs}`)
  }
  getProject(id: number) {
    return this.request(`/projects/${id}`)
  }
  getMyProjects() {
    return this.request('/projects/my/projects')
  }
  createProject(body: {
    title: string
    description: string
    category?: string
    budget_min?: number
    budget_max?: number
    location?: string
    timeline_days?: number
  }) {
    return this.request('/projects', { method: 'POST', body: JSON.stringify(body) })
  }

  // BIDS
  getMyBids() {
    return this.request('/bids/my/bids')
  }
  submitBid(body: { project_id: number; amount: number; proposed_timeline_days?: number; message?: string }) {
    return this.request('/bids', { method: 'POST', body: JSON.stringify(body) })
  }
  acceptBid(id: number) {
    return this.request(`/bids/${id}/accept`, { method: 'POST' })
  }

  // ESCROW
  createEscrow(body: { projectId: number; homeownerId: number; contractorId: number; amount: number }) {
    return this.request('/escrow/create', { method: 'POST', body: JSON.stringify(body) })
  }
  getEscrow(id: number) {
    return this.request(`/escrow/${id}`)
  }
  createMilestone(escrowId: number, body: { title: string; description?: string; amount: number }) {
    return this.request(`/escrow/${escrowId}/milestones`, { method: 'POST', body: JSON.stringify(body) })
  }
  submitMilestone(id: number) {
    return this.request(`/milestones/${id}/submit`, { method: 'POST' })
  }
  approveMilestone(id: number) {
    return this.request(`/milestones/${id}/approve`, { method: 'POST' })
  }
  releaseMilestone(id: number) {
    return this.request(`/milestones/${id}/release`, { method: 'POST' })
  }
  disputeMilestone(id: number) {
    return this.request(`/milestones/${id}/dispute`, { method: 'POST' })
  }

  // TOKEN
  getTokenInfo() {
    return this.request('/token/info')
  }
  getPriceHistory() {
    return this.request('/token/price-history')
  }
  calculateStaking(body: { amount: number; duration: number }) {
    return this.request('/token/staking/calculate', { method: 'POST', body: JSON.stringify(body) })
  }

  // WALLET
  connectWallet(body: { accountName: string; permission?: string; publicKey?: string; walletType?: string }) {
    return this.request('/wallet/connect', { method: 'POST', body: JSON.stringify(body) })
  }
  getConnectedWallet() {
    return this.request('/wallet/me')
  }
  getBalance(account: string) {
    return this.request(`/wallet/balance/${account}`)
  }
}

export const api = new ApiClient()
