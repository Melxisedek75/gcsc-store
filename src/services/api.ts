// GCSC API Client
const API_BASE = import.meta.env.VITE_API_URL || 'https://gcsc-api.onrender.com/api'

class ApiClient {
  private token: string | null = null

  setToken(token: string) { this.token = token }
  clearToken() { this.token = null }

  private async request(path: string, options: RequestInit = {}) {
    const url = `${API_BASE}${path}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>
    }
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`

    const res = await fetch(url, { ...options, headers })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || `API error: ${res.status}`)
    return data
  }

  // AUTH
  register(body: { email: string; password: string; role: string; fullName: string }) {
    return this.request('/auth/register', { method: 'POST', body: JSON.stringify(body) })
  }
  login(body: { email: string; password: string }) {
    return this.request('/auth/login', { method: 'POST', body: JSON.stringify(body) })
  }
  getProfile() {
    return this.request('/auth/profile')
  }

  // PROJECTS
  getProjects(filters?: Record<string, string>) {
    const qs = filters ? '?' + new URLSearchParams(filters) : ''
    return this.request(`/projects${qs}`)
  }
  getProject(id: number) {
    return this.request(`/projects/${id}`)
  }

  // BIDS
  getBids() {
    return this.request('/bids')
  }
  submitBid(body: { projectId: number; contractorId: number; amount: number; message?: string }) {
    return this.request('/bids', { method: 'POST', body: JSON.stringify(body) })
  }

  // ESCROW
  createEscrow(body: { projectId: number; homeownerId: number; contractorId: number; amount: number }) {
    return this.request('/escrow/create', { method: 'POST', body: JSON.stringify(body) })
  }
  getEscrow(id: number) {
    return this.request(`/escrow/${id}`)
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
  connectWallet(body: { accountName: string; publicKey?: string }) {
    return this.request('/wallet/connect', { method: 'POST', body: JSON.stringify(body) })
  }
  getBalance(account: string) {
    return this.request(`/wallet/balance/${account}`)
  }
}

export const api = new ApiClient()
