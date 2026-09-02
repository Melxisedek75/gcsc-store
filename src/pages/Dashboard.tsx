import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { api, type GcscUser } from '../services/api';
import {
  LayoutDashboard,
  Calculator,
  ClipboardList,
  UserCircle,
  Wallet,
  Coins,
  Menu,
  X,
  ChevronRight,
  DollarSign,
  CheckCircle2,
  LogOut,
  Loader2,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import { getProfile, initials } from './dashboard/format';
import type { Section } from './dashboard/types';
import { AccountAccess } from './dashboard/AccountAccess';

class PanelErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null as string | null };
  static getDerivedStateFromError(error: Error) {
    return { error: error.message || 'Panel failed to render' };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-6">
          <p className="font-outfit font-bold text-[#991B1B]">This dashboard panel crashed.</p>
          <p className="text-sm text-[#7F1D1D] mt-2">{this.state.error}</p>
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            className="mt-4 rounded-full px-4 py-2 text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 100%)' }}
          >
            Retry panel
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const PLATFORM_ADMIN_EMAILS = ['serhiykbusiness@gmail.com'];

function isAdminUser(user: GcscUser | null | undefined) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return PLATFORM_ADMIN_EMAILS.includes(String(user.email || '').trim().toLowerCase());
}

const ProjectsPanel = lazy(() => import('./dashboard/ProjectsPanel').then((m) => ({ default: m.ProjectsPanel })));
const EstimatorPanel = lazy(() => import('./dashboard/EstimatorPanel').then((m) => ({ default: m.EstimatorPanel })));
const BidsPanel = lazy(() => import('./dashboard/BidsPanel').then((m) => ({ default: m.BidsPanel })));
const LoansFinancingPanel = lazy(() => import('./dashboard/LoansFinancingPanel').then((m) => ({ default: m.LoansFinancingPanel })));
const ProfilePanel = lazy(() => import('./dashboard/ProfilePanel').then((m) => ({ default: m.ProfilePanel })));
const CompliancePanel = lazy(() => import('./dashboard/CompliancePanel').then((m) => ({ default: m.CompliancePanel })));
const AdminDocumentReviewPanel = lazy(() => import('./dashboard/AdminDocumentReviewPanel').then((m) => ({ default: m.AdminDocumentReviewPanel })));
const AdminFinancingPrechecksPanel = lazy(() => import('./dashboard/AdminFinancingPrechecksPanel').then((m) => ({ default: m.AdminFinancingPrechecksPanel })));
const AdminAuditLogPanel = lazy(() => import('./dashboard/AdminAuditLogPanel').then((m) => ({ default: m.AdminAuditLogPanel })));
const WalletPanel = lazy(() => import('./dashboard/WalletPanel').then((m) => ({ default: m.WalletPanel })));
const TokenRedirect = lazy(() => import('./dashboard/TokenRedirect').then((m) => ({ default: m.TokenRedirect })));

const navItems: { key: Section; label: string; icon: typeof LayoutDashboard; adminOnly?: boolean }[] = [
  { key: 'projects', label: 'Projects', icon: LayoutDashboard },
  { key: 'estimator', label: 'Estimator', icon: Calculator },
  { key: 'bids', label: 'My Bids', icon: ClipboardList },
  { key: 'loans', label: 'Loans', icon: DollarSign },
  { key: 'profile', label: 'Profile', icon: UserCircle },
  { key: 'compliance', label: 'Compliance', icon: ShieldCheck },
  { key: 'admin-review', label: 'Admin Review', icon: ShieldCheck, adminOnly: true },
  { key: 'admin-financing', label: 'Financing Review', icon: Wallet, adminOnly: true },
  { key: 'admin-audit', label: 'Audit Log', icon: Activity, adminOnly: true },
  { key: 'wallet', label: 'Wallet', icon: Wallet },
];

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState<Section>(() => {
    const saved = sessionStorage.getItem('gcsc_dashboard_section') as Section | null;
    return saved || 'projects';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<GcscUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [registrationNotice, setRegistrationNotice] = useState<{ email?: string; phone?: string } | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadProfile = async () => {
      try {
        const response = await api.getProfile();
        if (mounted) setUser(response.user);
      } catch {
        api.clearToken();
      } finally {
        if (mounted) setLoadingUser(false);
      }
    };
    if (localStorage.getItem('gcsc_auth_token')) loadProfile();
    else setLoadingUser(false);
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    sessionStorage.setItem('gcsc_dashboard_section', activeSection);
  }, [activeSection]);

  useEffect(() => {
    if (!user) return;
    const rawNotice = sessionStorage.getItem('gcsc_registration_notice');
    if (!rawNotice) return;
    try {
      setRegistrationNotice(JSON.parse(rawNotice) as { email?: string; phone?: string });
    } catch {
      setRegistrationNotice({});
    }
    sessionStorage.removeItem('gcsc_registration_notice');
  }, [user]);

  const logout = () => {
    api.logout();
    setUser(null);
    setActiveSection('projects');
  };

  const renderPanel = () => {
    if (!user) return null;
    switch (activeSection) {
      case 'projects': return <ProjectsPanel user={user} />;
      case 'estimator': return <EstimatorPanel />;
      case 'bids': return <BidsPanel user={user} />;
      case 'loans': return <LoansFinancingPanel user={user} />;
      case 'profile': return <ProfilePanel user={user} onUserChange={setUser} />;
      case 'compliance': return <CompliancePanel user={user} />;
      case 'admin-review': return isAdminUser(user) ? <AdminDocumentReviewPanel /> : <ProjectsPanel user={user} />;
      case 'admin-financing': return isAdminUser(user) ? <AdminFinancingPrechecksPanel /> : <ProjectsPanel user={user} />;
      case 'admin-audit': return isAdminUser(user) ? <AdminAuditLogPanel /> : <ProjectsPanel user={user} />;
      case 'wallet': return <WalletPanel user={user} onUserChange={setUser} />;
      case 'token': return <TokenRedirect />;
      default: return <ProjectsPanel user={user} />;
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-[100dvh] bg-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#7B2FF7] font-inter font-semibold">
          <Loader2 size={22} className="animate-spin" />
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (!user) return <AccountAccess onAuthenticated={setUser} />;

  const profile = getProfile(user);
  const visibleNavItems = navItems.filter((item) => !item.adminOnly || isAdminUser(user));

  return (
    <div className="min-h-[100dvh] bg-white flex">
      <aside className="hidden lg:flex flex-col w-[240px] shrink-0 border-r border-[#E2E8F0] bg-[#F8FAFC] fixed left-0 top-[72px] bottom-0 overflow-y-auto z-40">
        <nav className="flex-1 px-3 py-6 space-y-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.key;
            return (
              <button key={item.key} onClick={() => setActiveSection(item.key)} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200" style={{ backgroundColor: isActive ? 'rgba(123,47,247,0.08)' : 'transparent', color: isActive ? '#7B2FF7' : '#475569' }}>
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-[#E2E8F0]">
          <p className="text-sm font-medium text-[#0F172A] truncate">{user.fullName || user.full_name || user.email}</p>
          <p className="text-xs text-[#94A3B8] truncate">{isAdminUser(user) ? 'Admin account' : user.role === 'contractor' ? 'Builder account' : 'Owner account'}</p>
          <button onClick={logout} className="mt-4 w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-[#64748B]">
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 lg:ml-[240px] min-w-0">
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC] sticky top-0 z-30">
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 rounded-lg text-[#0F172A]"><Menu size={20} /></button>
          <span className="font-outfit font-semibold text-[#0F172A]">{visibleNavItems.find((n) => n.key === activeSection)?.label || 'Dashboard'}</span>
        </div>
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/30" onClick={() => setMobileMenuOpen(false)}>
            <div className="w-[260px] h-full bg-[#F8FAFC] p-4" onClick={(e) => e.stopPropagation()}>
              {visibleNavItems.map((item) => (
                <button key={item.key} onClick={() => { setActiveSection(item.key); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-3 text-sm font-medium text-[#0F172A]">{item.label}</button>
              ))}
            </div>
          </div>
        )}
        <div className="container-padding py-8 max-w-[1200px]">
          <PanelErrorBoundary key={activeSection}>
            <Suspense fallback={<div className="flex items-center justify-center py-20 text-[#7B2FF7]"><Loader2 size={22} className="animate-spin" /><span className="ml-2 text-sm font-semibold">Loading panel...</span></div>}>
              {renderPanel()}
            </Suspense>
          </PanelErrorBoundary>
        </div>
      </main>
    </div>
  );
}
