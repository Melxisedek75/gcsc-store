import { useEffect, useState, useMemo, type FormEvent, type ChangeEvent } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { api, type GcscProfile, type GcscUser } from '../services/api';
import { connectWebAuthWallet } from '../services/webauth';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  LayoutDashboard,
  Calculator,
  ClipboardList,
  UserCircle,
  Wallet,
  Coins,
  Menu,
  X,
  Eye,
  Gavel,
  ChevronRight,
  AlertTriangle,
  Clock,
  DollarSign,
  CheckCircle2,
  Clock4,
  Award,
  XCircle,
  Search,
  SlidersHorizontal,
  Save,
  Upload,
  LogOut,
  Building2,
  Home,
  Loader2,
  PlugZap,
  ShieldCheck,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Section = 'projects' | 'estimator' | 'bids' | 'profile' | 'wallet' | 'token';

type ProjectStatus = 'New' | 'Pending' | 'Accepted' | 'Completed';

interface Project {
  id: string;
  homeowner: string;
  type: string;
  location: string;
  budgetMin: number;
  budgetMax: number;
  status: ProjectStatus;
  date: string;
}

interface Bid {
  id: string;
  projectId: string;
  projectName: string;
  homeowner: string;
  amount: number;
  status: 'Submitted' | 'Under Review' | 'Accepted' | 'Declined' | 'Awarded';
  date: string;
}

type ProjectType =
  | 'Kitchen Remodel'
  | 'Bathroom'
  | 'Roofing'
  | 'Flooring'
  | 'Electrical'
  | 'Plumbing'
  | 'Full Renovation'
  | 'New Construction';

type MaterialQuality = 'Basic' | 'Standard' | 'Premium' | 'Luxury';
type LaborComplexity = 'Simple' | 'Moderate' | 'Complex';

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

const projects: Project[] = [
  {
    id: 'PRJ-2026-0042',
    homeowner: 'Homeowner Request A',
    type: 'Kitchen Remodel',
    location: 'Austin, TX',
    budgetMin: 25000,
    budgetMax: 40000,
    status: 'New',
    date: '2026-02-18',
  },
  {
    id: 'PRJ-2026-0038',
    homeowner: 'Homeowner Request B',
    type: 'Full Renovation',
    location: 'Denver, CO',
    budgetMin: 120000,
    budgetMax: 180000,
    status: 'Pending',
    date: '2026-02-15',
  },
  {
    id: 'PRJ-2026-0035',
    homeowner: 'Homeowner Request C',
    type: 'Roofing',
    location: 'Phoenix, AZ',
    budgetMin: 15000,
    budgetMax: 28000,
    status: 'New',
    date: '2026-02-14',
  },
  {
    id: 'PRJ-2026-0029',
    homeowner: 'Homeowner Request D',
    type: 'Bathroom',
    location: 'Seattle, WA',
    budgetMin: 18000,
    budgetMax: 32000,
    status: 'Accepted',
    date: '2026-02-10',
  },
  {
    id: 'PRJ-2026-0021',
    homeowner: 'Homeowner Request E',
    type: 'Electrical',
    location: 'Miami, FL',
    budgetMin: 8000,
    budgetMax: 15000,
    status: 'Completed',
    date: '2026-01-28',
  },
  {
    id: 'PRJ-2026-0018',
    homeowner: 'Homeowner Request F',
    type: 'Flooring',
    location: 'Portland, OR',
    budgetMin: 12000,
    budgetMax: 22000,
    status: 'Pending',
    date: '2026-01-25',
  },
];

const bids: Bid[] = [
  {
    id: 'BID-0091',
    projectId: 'PRJ-2026-0042',
    projectName: 'Kitchen Remodel',
    homeowner: 'Homeowner Request A',
    amount: 32500,
    status: 'Submitted',
    date: '2026-02-19',
  },
  {
    id: 'BID-0085',
    projectId: 'PRJ-2026-0038',
    projectName: 'Full Renovation',
    homeowner: 'Homeowner Request B',
    amount: 155000,
    status: 'Under Review',
    date: '2026-02-17',
  },
  {
    id: 'BID-0079',
    projectId: 'PRJ-2026-0035',
    projectName: 'Roofing Replacement',
    homeowner: 'Homeowner Request C',
    amount: 22000,
    status: 'Accepted',
    date: '2026-02-16',
  },
  {
    id: 'BID-0072',
    projectId: 'PRJ-2026-0029',
    projectName: 'Bathroom Renovation',
    homeowner: 'Homeowner Request D',
    amount: 28500,
    status: 'Awarded',
    date: '2026-02-12',
  },
  {
    id: 'BID-0065',
    projectId: 'PRJ-2026-0015',
    projectName: 'Plumbing Overhaul',
    homeowner: 'Homeowner Request E',
    amount: 14200,
    status: 'Declined',
    date: '2026-02-08',
  },
];

/* ------------------------------------------------------------------ */
/*  Pricing Engine                                                     */
/* ------------------------------------------------------------------ */

const BASE_SQFT_RATES: Record<ProjectType, number> = {
  'Kitchen Remodel': 175,
  Bathroom: 145,
  Roofing: 85,
  Flooring: 35,
  Electrical: 42,
  Plumbing: 55,
  'Full Renovation': 125,
  'New Construction': 165,
};

const MATERIAL_MULTIPLIERS: Record<MaterialQuality, number> = {
  Basic: 0.75,
  Standard: 1.0,
  Premium: 1.45,
  Luxury: 2.2,
};

const LABOR_MULTIPLIERS: Record<LaborComplexity, number> = {
  Simple: 0.85,
  Moderate: 1.0,
  Complex: 1.55,
};

const PERMITS_PCT = 0.08;
const TIMELINE_WEEKS: Record<ProjectType, number> = {
  'Kitchen Remodel': 6,
  Bathroom: 4,
  Roofing: 2,
  Flooring: 1.5,
  Electrical: 2,
  Plumbing: 2.5,
  'Full Renovation': 14,
  'New Construction': 26,
};

const TIMELINE_MULTIPLIERS: Record<LaborComplexity, number> = {
  Simple: 0.8,
  Moderate: 1.0,
  Complex: 1.5,
};

interface EstimationResult {
  lowCost: number;
  highCost: number;
  materialsPct: number;
  laborPct: number;
  permitsPct: number;
  timelineWeeks: number;
  breakdown: { name: string; value: number; color: string }[];
  risks: string[];
}

function calculateEstimate(
  projectType: ProjectType,
  sqft: number,
  material: MaterialQuality,
  labor: LaborComplexity
): EstimationResult | null {
  if (!projectType || !sqft || !material || !labor) return null;

  const baseRate = BASE_SQFT_RATES[projectType];
  const matMult = MATERIAL_MULTIPLIERS[material];
  const labMult = LABOR_MULTIPLIERS[labor];

  const baseCost = baseRate * sqft;
  const materialCost = baseCost * matMult * 0.52;
  const laborCost = baseCost * labMult * 0.40;
  const permitsCost = baseCost * PERMITS_PCT;

  const lowCost = Math.round(materialCost * 0.9 + laborCost * 0.9 + permitsCost * 0.95);
  const highCost = Math.round(materialCost * 1.15 + laborCost * 1.15 + permitsCost * 1.1);

  const total = materialCost + laborCost + permitsCost;
  const materialsPct = Math.round((materialCost / total) * 100);
  const laborPct = Math.round((laborCost / total) * 100);
  const permitsPct = Math.round((permitsCost / total) * 100);

  const baseWeeks = TIMELINE_WEEKS[projectType];
  const timelineWeeks = Math.round(baseWeeks * TIMELINE_MULTIPLIERS[labor] * 10) / 10;

  const risks: string[] = [];
  if (labor === 'Complex') {
    risks.push('Complex labor may require specialized subcontractors — factor 15% contingency.');
  }
  if (material === 'Luxury') {
    risks.push('Luxury materials may have extended lead times — confirm delivery schedules.');
  }
  if (projectType === 'Full Renovation' || projectType === 'New Construction') {
    risks.push('Large-scope projects carry higher variance — recommend phased contract milestones.');
  }
  if (timelineWeeks > 8) {
    risks.push('Extended timeline increases exposure to weather and market price fluctuations.');
  }
  if (risks.length === 0) {
    risks.push('Standard risk profile — typical safeguards recommended.');
  }

  const breakdown = [
    { name: 'Materials', value: materialsPct, color: '#7B2FF7' },
    { name: 'Labor', value: laborPct, color: '#3B6BF7' },
    { name: 'Permits & Fees', value: permitsPct, color: '#00D4FF' },
  ];

  return {
    lowCost,
    highCost,
    materialsPct,
    laborPct,
    permitsPct,
    timelineWeeks,
    breakdown,
    risks,
  };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const statusConfig: Record<string, { color: string; bg: string; icon: typeof CheckCircle2 }> = {
  New: { color: '#7B2FF7', bg: 'rgba(123,47,247,0.1)', icon: Award },
  Pending: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: Clock4 },
  Accepted: { color: '#3B6BF7', bg: 'rgba(59,107,247,0.1)', icon: CheckCircle2 },
  Completed: { color: '#10B981', bg: 'rgba(16,185,129,0.1)', icon: CheckCircle2 },
  Submitted: { color: '#7B2FF7', bg: 'rgba(123,47,247,0.1)', icon: ClipboardList },
  'Under Review': { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: Clock4 },
  Awarded: { color: '#10B981', bg: 'rgba(16,185,129,0.1)', icon: Award },
  Declined: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)', icon: XCircle },
};

/* ------------------------------------------------------------------ */
/*  Sidebar                                                            */
/* ------------------------------------------------------------------ */

const navItems: { key: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'projects', label: 'Projects', icon: LayoutDashboard },
  { key: 'estimator', label: 'Estimator', icon: Calculator },
  { key: 'bids', label: 'My Bids', icon: ClipboardList },
  { key: 'profile', label: 'Profile', icon: UserCircle },
  { key: 'wallet', label: 'Wallet', icon: Wallet },
];

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] || statusConfig['New'];
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ color: cfg.color, backgroundColor: cfg.bg }}
    >
      <Icon size={12} />
      {status}
    </span>
  );
}

/* ---- Projects Panel ---- */

function ProjectsPanel() {
  const [filter, setFilter] = useState<ProjectStatus | 'All'>('All');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesFilter = filter === 'All' || p.status === filter;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        p.homeowner.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [filter, search]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-outfit font-bold text-[1.5rem] text-[#0F172A]">
            Incoming Projects
          </h2>
          <p className="font-inter text-sm text-[#475569] mt-1">
            Review and bid on new project requests from homeowners
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg border border-[#E2E8F0] bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#7B2FF7]/30 focus:border-[#7B2FF7] transition-all w-[220px]"
            />
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['All', 'New', 'Pending', 'Accepted', 'Completed'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className="px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
            style={{
              backgroundColor: filter === s ? '#7B2FF7' : '#F1F5F9',
              color: filter === s ? '#FFFFFF' : '#475569',
            }}
          >
            {s}
          </button>
        ))}
        <div className="ml-auto text-sm text-[#475569]">
          <SlidersHorizontal size={16} className="inline mr-1" />
          {filtered.length} project{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <th className="text-left px-4 py-3 font-semibold text-[#0F172A] text-xs uppercase tracking-wider">
                  Project ID
                </th>
                <th className="text-left px-4 py-3 font-semibold text-[#0F172A] text-xs uppercase tracking-wider">
                  Homeowner
                </th>
                <th className="text-left px-4 py-3 font-semibold text-[#0F172A] text-xs uppercase tracking-wider">
                  Type
                </th>
                <th className="text-left px-4 py-3 font-semibold text-[#0F172A] text-xs uppercase tracking-wider">
                  Location
                </th>
                <th className="text-left px-4 py-3 font-semibold text-[#0F172A] text-xs uppercase tracking-wider">
                  Budget Range
                </th>
                <th className="text-left px-4 py-3 font-semibold text-[#0F172A] text-xs uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-semibold text-[#0F172A] text-xs uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC]/60 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs text-[#3B6BF7] font-medium">
                    {p.id}
                  </td>
                  <td className="px-4 py-3 font-medium text-[#0F172A]">{p.homeowner}</td>
                  <td className="px-4 py-3 text-[#475569]">{p.type}</td>
                  <td className="px-4 py-3 text-[#475569]">{p.location}</td>
                  <td className="px-4 py-3 font-medium text-[#0F172A]">
                    {formatCurrency(p.budgetMin)} – {formatCurrency(p.budgetMax)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0] hover:text-[#0F172A] transition-colors">
                        <Eye size={12} />
                        View
                      </button>
                      {p.status !== 'Completed' && (
                        <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium text-white transition-all hover:scale-[1.04]"
                          style={{ background: 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 100%)' }}
                        >
                          <Gavel size={12} />
                          Bid
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-[#94A3B8]">
            No projects match your filters.
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ---- Estimator Panel ---- */

function EstimatorPanel() {
  const [projectType, setProjectType] = useState<ProjectType | ''>('');
  const [city, setCity] = useState('');
  const [sqft, setSqft] = useState('');
  const [material, setMaterial] = useState<MaterialQuality | ''>('');
  const [labor, setLabor] = useState<LaborComplexity | ''>('');
  const [result, setResult] = useState<EstimationResult | null>(null);

  const handleCalculate = () => {
    if (!projectType || !sqft || !material || !labor) return;
    const est = calculateEstimate(
      projectType as ProjectType,
      Number(sqft),
      material as MaterialQuality,
      labor as LaborComplexity
    );
    setResult(est);
  };

  const projectTypes: ProjectType[] = [
    'Kitchen Remodel',
    'Bathroom',
    'Roofing',
    'Flooring',
    'Electrical',
    'Plumbing',
    'Full Renovation',
    'New Construction',
  ];
  const materials: MaterialQuality[] = ['Basic', 'Standard', 'Premium', 'Luxury'];
  const labors: LaborComplexity[] = ['Simple', 'Moderate', 'Complex'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="space-y-6"
    >
      <div>
        <h2 className="font-outfit font-bold text-[1.5rem] text-[#0F172A]">
          Cost Estimator
        </h2>
        <p className="font-inter text-sm text-[#475569] mt-1">
          Generate accurate project cost estimates based on scope, materials, and labor
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="glass-card p-6 space-y-5">
          <h3 className="font-outfit font-semibold text-[1.0625rem] text-[#0F172A] mb-4">
            Project Details
          </h3>

          {/* Project Type */}
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] uppercase tracking-wider mb-2">
              Project Type
            </label>
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value as ProjectType)}
              className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#7B2FF7]/30 focus:border-[#7B2FF7] transition-all appearance-none cursor-pointer"
            >
              <option value="">Select project type...</option>
              {projectTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* City/State */}
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] uppercase tracking-wider mb-2">
              City / State
            </label>
            <input
              type="text"
              placeholder="e.g. Austin, TX"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#7B2FF7]/30 focus:border-[#7B2FF7] transition-all"
            />
          </div>

          {/* Square Footage */}
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] uppercase tracking-wider mb-2">
              Square Footage
            </label>
            <input
              type="number"
              placeholder="e.g. 1200"
              value={sqft}
              onChange={(e) => setSqft(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#7B2FF7]/30 focus:border-[#7B2FF7] transition-all"
            />
          </div>

          {/* Material Quality */}
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] uppercase tracking-wider mb-2">
              Material Quality
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {materials.map((m) => (
                <button
                  key={m}
                  onClick={() => setMaterial(m)}
                  className="px-3 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
                  style={{
                    borderColor: material === m ? '#7B2FF7' : '#E2E8F0',
                    backgroundColor: material === m ? 'rgba(123,47,247,0.08)' : '#FFFFFF',
                    color: material === m ? '#7B2FF7' : '#475569',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Labor Complexity */}
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] uppercase tracking-wider mb-2">
              Labor Complexity
            </label>
            <div className="grid grid-cols-3 gap-2">
              {labors.map((l) => (
                <button
                  key={l}
                  onClick={() => setLabor(l)}
                  className="px-3 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
                  style={{
                    borderColor: labor === l ? '#7B2FF7' : '#E2E8F0',
                    backgroundColor: labor === l ? 'rgba(123,47,247,0.08)' : '#FFFFFF',
                    color: labor === l ? '#7B2FF7' : '#475569',
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={handleCalculate}
            disabled={!projectType || !sqft || !material || !labor}
            className="w-full py-3 rounded-full text-white font-inter font-semibold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] hover:shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 50%, #00D4FF 100%)',
              boxShadow: projectType && sqft && material && labor ? '0 4px 20px rgba(123,47,247,0.3)' : 'none',
            }}
          >
            Calculate Estimate
          </button>
        </div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="space-y-5"
            >
              {/* Cost Range Card */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign size={18} className="text-[#7B2FF7]" />
                  <h3 className="font-outfit font-semibold text-[1.0625rem] text-[#0F172A]">
                    Estimated Cost Range
                  </h3>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-outfit font-bold text-[2.5rem] text-[#0F172A]">
                    {formatCurrency(result.lowCost)}
                  </span>
                  <span className="text-[#94A3B8] font-medium">–</span>
                  <span className="font-outfit font-bold text-[2.5rem] gradient-text">
                    {formatCurrency(result.highCost)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#475569]">
                  <Clock size={14} />
                  <span>Estimated timeline: <strong className="text-[#0F172A]">{result.timelineWeeks} weeks</strong></span>
                </div>
              </div>

              {/* Breakdown Chart */}
              <div className="glass-card p-6">
                <h3 className="font-outfit font-semibold text-[1.0625rem] text-[#0F172A] mb-4">
                  Cost Breakdown
                </h3>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={result.breakdown} layout="vertical" barSize={28}>
                      <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#0F172A', fontWeight: 500 }} axisLine={false} tickLine={false} width={90} />
                      <Tooltip
                        formatter={(value: number) => [`${value}%`, '']}
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid rgba(123,47,247,0.2)',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                        {result.breakdown.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mt-3">
                  {result.breakdown.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-[#475569]">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Factors */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={16} className="text-[#F59E0B]" />
                  <h3 className="font-outfit font-semibold text-[1.0625rem] text-[#0F172A]">
                    Risk Factors
                  </h3>
                </div>
                <ul className="space-y-2">
                  {result.risks.map((risk, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#475569]">
                      <ChevronRight size={14} className="text-[#7B2FF7] mt-0.5 shrink-0" />
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}

          {!result && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-6 flex flex-col items-center justify-center min-h-[400px] text-center"
            >
              <div className="w-16 h-16 rounded-full bg-[#F1F5F9] flex items-center justify-center mb-4">
                <Calculator size={28} className="text-[#94A3B8]" />
              </div>
              <h3 className="font-outfit font-semibold text-[#0F172A] mb-1">
                Ready to Estimate
              </h3>
              <p className="text-sm text-[#94A3B8] max-w-[280px]">
                Fill in the project details and click Calculate to generate a cost breakdown.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ---- Bids Panel ---- */

function BidsPanel() {
  const [filter, setFilter] = useState<string>('All');

  const filtered = useMemo(() => {
    if (filter === 'All') return bids;
    return bids.filter((b) => b.status === filter);
  }, [filter]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-outfit font-bold text-[1.5rem] text-[#0F172A]">
            My Bids
          </h2>
          <p className="font-inter text-sm text-[#475569] mt-1">
            Track the status of your submitted proposals
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['All', 'Submitted', 'Under Review', 'Accepted', 'Awarded', 'Declined'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className="px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
            style={{
              backgroundColor: filter === s ? '#7B2FF7' : '#F1F5F9',
              color: filter === s ? '#FFFFFF' : '#475569',
            }}
          >
            {s}
          </button>
        ))}
        <div className="ml-auto text-sm text-[#475569]">
          {filtered.length} bid{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <th className="text-left px-4 py-3 font-semibold text-[#0F172A] text-xs uppercase tracking-wider">
                  Bid ID
                </th>
                <th className="text-left px-4 py-3 font-semibold text-[#0F172A] text-xs uppercase tracking-wider">
                  Project
                </th>
                <th className="text-left px-4 py-3 font-semibold text-[#0F172A] text-xs uppercase tracking-wider">
                  Homeowner
                </th>
                <th className="text-left px-4 py-3 font-semibold text-[#0F172A] text-xs uppercase tracking-wider">
                  Bid Amount
                </th>
                <th className="text-left px-4 py-3 font-semibold text-[#0F172A] text-xs uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-semibold text-[#0F172A] text-xs uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left px-4 py-3 font-semibold text-[#0F172A] text-xs uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC]/60 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs text-[#3B6BF7] font-medium">
                    {b.id}
                  </td>
                  <td className="px-4 py-3 font-medium text-[#0F172A]">{b.projectName}</td>
                  <td className="px-4 py-3 text-[#475569]">{b.homeowner}</td>
                  <td className="px-4 py-3 font-semibold text-[#0F172A]">
                    {formatCurrency(b.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-4 py-3 text-[#475569]">{formatDate(b.date)}</td>
                  <td className="px-4 py-3">
                    <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0] hover:text-[#0F172A] transition-colors">
                      <Eye size={12} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-[#94A3B8]">
            No bids match your filter.
          </div>
        )}
      </div>
    </motion.div>
  );
}

type AccountRole = 'contractor' | 'homeowner';

const fieldClass =
  'w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#7B2FF7]/30 focus:border-[#7B2FF7] transition-all';

function getProfile(user: GcscUser): GcscProfile {
  return {
    accountType: user.role,
    companyName: '',
    businessName: '',
    ein: '',
    licenseNumber: '',
    serviceArea: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    specialties: [],
    yearsInBusiness: '',
    website: '',
    bio: '',
    logoDataUrl: '',
    projectNeeds: '',
    propertyAddress: '',
    propertyType: '',
    budgetRange: '',
    ...(user.profile || {}),
  };
}

function initials(user: GcscUser): string {
  const label = user.fullName || user.full_name || user.email;
  return label
    .split(/\s|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'GC';
}

function RoleBadge({ role }: { role: AccountRole }) {
  const isContractor = role === 'contractor';
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[rgba(123,47,247,0.08)] text-[#7B2FF7]">
      {isContractor ? <Building2 size={13} /> : <Home size={13} />}
      {isContractor ? 'Builder / Contractor' : 'Owner / Homeowner'}
    </span>
  );
}

function AccountAccess({ onAuthenticated }: { onAuthenticated: (user: GcscUser) => void }) {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [role, setRole] = useState<AccountRole>('contractor');
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '' });
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('');
    setSubmitting(true);
    try {
      const response = mode === 'register'
        ? await api.register({ ...form, role })
        : await api.login({ email: form.email, password: form.password });
      api.setToken(response.token);
      onAuthenticated(response.user);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Could not complete account request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-white flex items-center justify-center container-padding py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[920px] grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6"
      >
        <div className="glass-card p-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7B2FF7] via-[#3B6BF7] to-[#00D4FF] flex items-center justify-center mb-5">
            <ShieldCheck size={30} className="text-white" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider gradient-text mb-3">Real GCSC account</p>
          <h1 className="font-outfit font-bold text-[2.2rem] leading-tight gradient-text shimmer-text">
            Register your construction profile.
          </h1>
          <p className="font-inter text-sm text-[#475569] mt-4 leading-7">
            Create a real account for the dashboard. Builders can save business, EIN, license,
            logo, and service data. Owners can save project and property information before escrow.
          </p>
          <div className="mt-6 space-y-3 text-sm text-[#475569]">
            <div className="flex gap-2"><CheckCircle2 size={18} className="text-[#10B981] shrink-0" /> Profile is saved through the backend API.</div>
            <div className="flex gap-2"><CheckCircle2 size={18} className="text-[#10B981] shrink-0" /> WebAuth wallet can be linked after login.</div>
            <div className="flex gap-2"><CheckCircle2 size={18} className="text-[#10B981] shrink-0" /> No demo account is shown by default.</div>
          </div>
        </div>

        <form onSubmit={submit} className="glass-card p-8 space-y-5">
          <div className="flex rounded-full bg-[#F1F5F9] p-1">
            {(['register', 'login'] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                className="flex-1 py-2.5 rounded-full text-sm font-semibold transition-all"
                style={{
                  background: mode === item ? 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 100%)' : 'transparent',
                  color: mode === item ? '#FFFFFF' : '#475569',
                }}
              >
                {item === 'register' ? 'Create account' : 'Sign in'}
              </button>
            ))}
          </div>

          {mode === 'register' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(['contractor', 'homeowner'] as const).map((item) => {
                const Icon = item === 'contractor' ? Building2 : Home;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setRole(item)}
                    className="flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all"
                    style={{
                      borderColor: role === item ? '#7B2FF7' : '#E2E8F0',
                      background: role === item ? 'rgba(123,47,247,0.08)' : '#FFFFFF',
                    }}
                  >
                    <Icon size={20} className={role === item ? 'text-[#7B2FF7]' : 'text-[#64748B]'} />
                    <span>
                      <span className="block text-sm font-semibold text-[#0F172A]">{item === 'contractor' ? 'Builder' : 'Owner'}</span>
                      <span className="block text-xs text-[#64748B]">{item === 'contractor' ? 'Business profile' : 'Project profile'}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {mode === 'register' && (
            <input
              className={fieldClass}
              placeholder="Full name"
              value={form.fullName}
              onChange={(e) => setForm((current) => ({ ...current, fullName: e.target.value }))}
              required
            />
          )}
          <input
            className={fieldClass}
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
            required
          />
          <input
            className={fieldClass}
            type="password"
            placeholder="Password, minimum 8 characters"
            value={form.password}
            onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))}
            minLength={8}
            required
          />
          {mode === 'register' && (
            <input
              className={fieldClass}
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))}
            />
          )}

          {status && <p className="text-sm text-[#EF4444]">{status}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full text-white font-inter font-semibold text-sm transition-all disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 55%, #00D4FF 100%)' }}
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {mode === 'register' ? 'Create GCSC Account' : 'Open Dashboard'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

/* ---- Profile Panel ---- */

function ProfilePanel({ user, onUserChange }: { user: GcscUser; onUserChange: (user: GcscUser) => void }) {
  const [profile, setProfile] = useState<GcscProfile>(() => getProfile(user));
  const [fullName, setFullName] = useState(user.fullName || user.full_name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const isContractor = user.role === 'contractor';

  const updateProfile = (field: keyof GcscProfile, value: string | string[]) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const onLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 750000) {
      setStatus('Logo file is too large. Please use an image under 750KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => updateProfile('logoDataUrl', String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    setSaving(true);
    setStatus('');
    try {
      const response = await api.updateProfile({
        ...profile,
        fullName,
        phone,
        specialties: profile.specialties || [],
      });
      onUserChange(response.user);
      setStatus('Profile saved.');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="space-y-6"
    >
      <div>
        <h2 className="font-outfit font-bold text-[1.5rem] gradient-text">Account Profile</h2>
        <p className="font-inter text-sm text-[#475569] mt-1">
          Save real business or property information for your GCSC account.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#7B2FF7] to-[#3B6BF7] flex items-center justify-center mx-auto mb-3 overflow-hidden">
            {profile.logoDataUrl ? (
              <img src={profile.logoDataUrl} alt="Account logo" className="w-full h-full object-cover" />
            ) : (
              <span className="font-outfit font-bold text-2xl text-white">{initials(user)}</span>
            )}
          </div>
          <h3 className="font-outfit font-bold gradient-text">{fullName || user.email}</h3>
          <p className="text-sm text-[#475569] mt-1">{user.email}</p>
          <div className="mt-3"><RoleBadge role={user.role} /></div>
          <label className="mt-5 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-[#C4B5FD] text-sm font-semibold text-[#7B2FF7] cursor-pointer hover:bg-[rgba(123,47,247,0.06)] transition-colors">
            <Upload size={15} />
            Upload logo
            <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={onLogoChange} />
          </label>
          <p className="text-xs text-[#94A3B8] mt-3">PNG, JPG, WEBP or GIF under 750KB.</p>
        </div>

        <div className="lg:col-span-2 glass-card p-6 space-y-4">
          <h3 className="font-outfit font-semibold text-[1.0625rem] gradient-text mb-4">
            {isContractor ? 'Builder Business Details' : 'Owner Project Details'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-1.5">
              <span className="text-xs font-semibold text-[#7B2FF7] uppercase tracking-wider">Full name</span>
              <input className={fieldClass} value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-semibold text-[#7B2FF7] uppercase tracking-wider">Phone</span>
              <input className={fieldClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
          </div>

          {isContractor ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="space-y-1.5">
                  <span className="text-xs font-semibold text-[#7B2FF7] uppercase tracking-wider">Company name</span>
                  <input className={fieldClass} value={profile.companyName || ''} onChange={(e) => updateProfile('companyName', e.target.value)} />
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs font-semibold text-[#7B2FF7] uppercase tracking-wider">EIN</span>
                  <input className={fieldClass} value={profile.ein || ''} onChange={(e) => updateProfile('ein', e.target.value)} placeholder="XX-XXXXXXX" />
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs font-semibold text-[#7B2FF7] uppercase tracking-wider">License number</span>
                  <input className={fieldClass} value={profile.licenseNumber || ''} onChange={(e) => updateProfile('licenseNumber', e.target.value)} />
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs font-semibold text-[#7B2FF7] uppercase tracking-wider">Years in business</span>
                  <input className={fieldClass} value={profile.yearsInBusiness || ''} onChange={(e) => updateProfile('yearsInBusiness', e.target.value)} />
                </label>
              </div>
              <label className="space-y-1.5 block">
                <span className="text-xs font-semibold text-[#7B2FF7] uppercase tracking-wider">Service area</span>
                <input className={fieldClass} value={profile.serviceArea || ''} onChange={(e) => updateProfile('serviceArea', e.target.value)} placeholder="City, county, or state" />
              </label>
              <label className="space-y-1.5 block">
                <span className="text-xs font-semibold text-[#7B2FF7] uppercase tracking-wider">Specialties</span>
                <input
                  className={fieldClass}
                  value={(profile.specialties || []).join(', ')}
                  onChange={(e) => updateProfile('specialties', e.target.value.split(',').map((item) => item.trim()).filter(Boolean))}
                  placeholder="Kitchen, roofing, plumbing"
                />
              </label>
            </>
          ) : (
            <>
              <label className="space-y-1.5 block">
                <span className="text-xs font-semibold text-[#7B2FF7] uppercase tracking-wider">Property address</span>
                <input className={fieldClass} value={profile.propertyAddress || ''} onChange={(e) => updateProfile('propertyAddress', e.target.value)} />
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="space-y-1.5">
                  <span className="text-xs font-semibold text-[#7B2FF7] uppercase tracking-wider">Property type</span>
                  <input className={fieldClass} value={profile.propertyType || ''} onChange={(e) => updateProfile('propertyType', e.target.value)} placeholder="House, condo, duplex" />
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs font-semibold text-[#7B2FF7] uppercase tracking-wider">Budget range</span>
                  <input className={fieldClass} value={profile.budgetRange || ''} onChange={(e) => updateProfile('budgetRange', e.target.value)} placeholder="$10k - $40k" />
                </label>
              </div>
              <label className="space-y-1.5 block">
                <span className="text-xs font-semibold text-[#7B2FF7] uppercase tracking-wider">Project needs</span>
                <textarea className={`${fieldClass} min-h-[110px] resize-y`} value={profile.projectNeeds || ''} onChange={(e) => updateProfile('projectNeeds', e.target.value)} />
              </label>
            </>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="space-y-1.5">
              <span className="text-xs font-semibold text-[#7B2FF7] uppercase tracking-wider">City</span>
              <input className={fieldClass} value={profile.city || ''} onChange={(e) => updateProfile('city', e.target.value)} />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-semibold text-[#7B2FF7] uppercase tracking-wider">State</span>
              <input className={fieldClass} value={profile.state || ''} onChange={(e) => updateProfile('state', e.target.value)} />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-semibold text-[#7B2FF7] uppercase tracking-wider">ZIP</span>
              <input className={fieldClass} value={profile.zip || ''} onChange={(e) => updateProfile('zip', e.target.value)} />
            </label>
          </div>

          <label className="space-y-1.5 block">
            <span className="text-xs font-semibold text-[#7B2FF7] uppercase tracking-wider">Public bio / notes</span>
            <textarea className={`${fieldClass} min-h-[110px] resize-y`} value={profile.bio || ''} onChange={(e) => updateProfile('bio', e.target.value)} />
          </label>

          {status && <p className={`text-sm ${status.includes('saved') ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>{status}</p>}
          <button
            onClick={saveProfile}
            disabled={saving}
            className="mt-4 px-6 py-2.5 rounded-full text-white font-inter font-semibold text-sm transition-all hover:scale-[1.04]"
            style={{ background: 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 100%)' }}
          >
            {saving ? <Loader2 size={16} className="inline animate-spin mr-2" /> : <Save size={16} className="inline mr-2" />}
            Save Profile
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ---- Wallet Panel ---- */

function WalletPanel({ user, onUserChange }: { user: GcscUser; onUserChange: (user: GcscUser) => void }) {
  const [connecting, setConnecting] = useState(false);
  const [status, setStatus] = useState('');
  const wallet = user.wallet || null;

  const connectWallet = async () => {
    setConnecting(true);
    setStatus('');
    try {
      const webauthWallet = await connectWebAuthWallet();
      const response = await api.connectWallet(webauthWallet);
      onUserChange(response.user);
      setStatus('WebAuth wallet connected.');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Could not connect WebAuth wallet');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="space-y-6"
    >
      <div>
        <h2 className="font-outfit font-bold text-[1.5rem] gradient-text">WebAuth Wallet</h2>
        <p className="font-inter text-sm text-[#475569] mt-1">Connect your decentralized XPR Network wallet to this account.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 md:col-span-2">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7B2FF7] to-[#00D4FF] flex items-center justify-center shrink-0">
              <Wallet size={24} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-outfit font-bold text-[1.25rem] gradient-text">
                {wallet ? wallet.accountName : 'Connect WebAuth Wallet'}
              </h3>
              <p className="text-sm text-[#475569] mt-1">
                {wallet
                  ? `Permission: ${wallet.permission}. This XPR account is linked to your GCSC profile.`
                  : 'Use WebAuth to authorize your XPR account. The site stores only your account name and permission, not private keys.'}
              </p>
              {status && <p className={`text-sm mt-3 ${status.includes('connected') ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>{status}</p>}
              <button
                onClick={connectWallet}
                disabled={connecting}
                className="mt-5 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-white font-inter font-semibold text-sm transition-all disabled:opacity-60 hover:scale-[1.04]"
                style={{ background: 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 55%, #00D4FF 100%)' }}
              >
                {connecting ? <Loader2 size={16} className="animate-spin" /> : <PlugZap size={16} />}
                {wallet ? 'Reconnect WebAuth' : 'Connect WebAuth'}
              </button>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-2">
            <LockIcon />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#475569]">Private keys</span>
          </div>
          <p className="font-outfit font-bold text-[1.75rem] gradient-text">Never stored</p>
          <p className="text-xs text-[#94A3B8] mt-1">WebAuth signs in its own wallet flow.</p>
        </div>
      </div>
    </motion.div>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B6BF7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Dashboard                                                     */
/* ------------------------------------------------------------------ */

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState<Section>('projects');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<GcscUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

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

    if (localStorage.getItem('gcsc_auth_token')) {
      loadProfile();
    } else {
      setLoadingUser(false);
    }

    return () => {
      mounted = false;
    };
  }, []);

  const logout = () => {
    api.logout();
    setUser(null);
    setActiveSection('projects');
  };

  const renderPanel = () => {
    switch (activeSection) {
      case 'projects':
        return <ProjectsPanel />;
      case 'estimator':
        return <EstimatorPanel />;
      case 'bids':
        return <BidsPanel />;
      case 'profile':
        return user ? <ProfilePanel user={user} onUserChange={setUser} /> : null;
      case 'wallet':
        return user ? <WalletPanel user={user} onUserChange={setUser} /> : null;
      case 'token':
        return <TokenRedirect />;
      default:
        return <ProjectsPanel />;
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

  if (!user) {
    return <AccountAccess onAuthenticated={setUser} />;
  }

  const profile = getProfile(user);

  return (
    <div className="min-h-[100dvh] bg-white flex">
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex flex-col w-[240px] shrink-0 border-r border-[#E2E8F0] bg-[#F8FAFC] fixed left-0 top-[72px] bottom-0 overflow-y-auto z-40"
      >
        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: isActive ? 'rgba(123,47,247,0.08)' : 'transparent',
                  color: isActive ? '#7B2FF7' : '#475569',
                }}
              >
                <Icon size={18} />
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="ml-auto w-1 h-1 rounded-full"
                    style={{ backgroundColor: '#7B2FF7' }}
                  />
                )}
              </button>
            );
          })}

          {/* Divider */}
          <div className="my-3 border-t border-[#E2E8F0]" />

          {/* Token link */}
          <Link
            to="/token"
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#475569] hover:bg-[rgba(123,47,247,0.06)] hover:text-[#7B2FF7] transition-all duration-200"
          >
            <Coins size={18} />
            Token
            <ChevronRight size={14} className="ml-auto text-[#94A3B8]" />
          </Link>
        </nav>

        {/* Sidebar Footer */}
        <div className="px-4 py-4 border-t border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7B2FF7] to-[#3B6BF7] flex items-center justify-center overflow-hidden">
              {profile.logoDataUrl ? (
                <img src={profile.logoDataUrl} alt="Account logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-white">{initials(user)}</span>
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-[#0F172A] truncate">{user.fullName || user.full_name || user.email}</p>
              <p className="text-xs text-[#94A3B8] truncate">{user.role === 'contractor' ? 'Builder account' : 'Owner account'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-[#64748B] hover:text-[#7B2FF7] hover:bg-[rgba(123,47,247,0.06)] transition-colors"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/30 z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-[260px] bg-[#F8FAFC] border-r border-[#E2E8F0] z-50 flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-[#E2E8F0]">
                <span className="font-outfit font-bold text-[#0F172A]">Dashboard</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-[#475569]">
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        setActiveSection(item.key);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                      style={{
                        backgroundColor: isActive ? 'rgba(123,47,247,0.08)' : 'transparent',
                        color: isActive ? '#7B2FF7' : '#475569',
                      }}
                    >
                      <Icon size={18} />
                      {item.label}
                    </button>
                  );
                })}
                <div className="my-3 border-t border-[#E2E8F0]" />
                <Link
                  to="/token"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium text-[#475569] hover:bg-[rgba(123,47,247,0.06)] hover:text-[#7B2FF7] transition-all duration-200"
                >
                  <Coins size={18} />
                  Token
                  <ChevronRight size={14} className="ml-auto text-[#94A3B8]" />
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium text-[#475569] hover:bg-[rgba(123,47,247,0.06)] hover:text-[#7B2FF7] transition-all duration-200"
                >
                  <LogOut size={18} />
                  Sign out
                </button>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-[240px] min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC] sticky top-0 z-30">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg text-[#0F172A] hover:bg-[#E2E8F0] transition-colors"
          >
            <Menu size={20} />
          </button>
          <span className="font-outfit font-semibold text-[#0F172A]">
            {navItems.find((n) => n.key === activeSection)?.label || 'Dashboard'}
          </span>
        </div>

        <div className="container-padding py-8 max-w-[1200px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {renderPanel()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

/* ---- Token Redirect Placeholder ---- */

function TokenRedirect() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-[#F1F5F9] flex items-center justify-center mb-4">
        <Coins size={28} className="text-[#94A3B8]" />
      </div>
      <h2 className="font-outfit font-bold text-[1.5rem] text-[#0F172A] mb-2">Token Dashboard</h2>
      <p className="text-sm text-[#475569] max-w-[400px] mb-6">
        Navigate to the Token page for GCSC token management, staking, and rewards.
      </p>
      <Link
        to="/token"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-inter font-semibold text-sm transition-all hover:scale-[1.04]"
        style={{ background: 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 100%)' }}
      >
        Go to Token Page
        <ChevronRight size={16} />
      </Link>
    </motion.div>
  );
}
