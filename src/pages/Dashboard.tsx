import { useEffect, useState, useMemo, type FormEvent, type ChangeEvent } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { api, type GcscBid, type GcscChainTx, type GcscCompliance, type GcscEscrow, type GcscMilestone, type GcscProfile, type GcscProject, type GcscRequiredDocument, type GcscUser } from '../services/api';
import { connectWebAuthWallet } from '../services/webauth';
import { signEscrowMilestoneAction, type EscrowMilestoneChainAction } from '../services/xprSettlement';
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
  Plus,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Section = 'projects' | 'estimator' | 'bids' | 'profile' | 'compliance' | 'wallet' | 'token';

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

function projectStatusLabel(status: string): string {
  const map: Record<string, string> = {
    open: 'Open',
    pending: 'Pending',
    in_progress: 'In Progress',
    active: 'In Progress',
    disputed: 'Disputed',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return map[status] || status;
}

function bidStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: 'Submitted',
    accepted: 'Accepted',
    rejected: 'Declined',
  };
  return map[status] || status;
}

function milestoneStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: 'Pending',
    submitted: 'Submitted',
    approved: 'Approved',
    released: 'Released',
    disputed: 'Disputed',
  };
  return map[status] || status;
}

const statusConfig: Record<string, { color: string; bg: string; icon: typeof CheckCircle2 }> = {
  New: { color: '#7B2FF7', bg: 'rgba(123,47,247,0.1)', icon: Award },
  Open: { color: '#7B2FF7', bg: 'rgba(123,47,247,0.1)', icon: Award },
  Pending: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: Clock4 },
  Accepted: { color: '#3B6BF7', bg: 'rgba(59,107,247,0.1)', icon: CheckCircle2 },
  'In Progress': { color: '#3B6BF7', bg: 'rgba(59,107,247,0.1)', icon: Clock4 },
  Completed: { color: '#10B981', bg: 'rgba(16,185,129,0.1)', icon: CheckCircle2 },
  Submitted: { color: '#7B2FF7', bg: 'rgba(123,47,247,0.1)', icon: ClipboardList },
  Approved: { color: '#3B6BF7', bg: 'rgba(59,107,247,0.1)', icon: CheckCircle2 },
  Released: { color: '#10B981', bg: 'rgba(16,185,129,0.1)', icon: CheckCircle2 },
  Disputed: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)', icon: AlertTriangle },
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
  { key: 'compliance', label: 'Compliance', icon: ShieldCheck },
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

function ProjectRequestForm({ onCreated }: { onCreated: (project: GcscProject) => void }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'General Remodel',
    budget_min: '',
    budget_max: '',
    location: '',
    timeline_days: '30',
  });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  const update = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setStatus('');
    try {
      const response = await api.createProject({
        title: form.title,
        description: form.description,
        category: form.category,
        budget_min: Number(form.budget_min || 0),
        budget_max: Number(form.budget_max || 0),
        location: form.location,
        timeline_days: Number(form.timeline_days || 30),
      });
      onCreated(response.project);
      setForm({
        title: '',
        description: '',
        category: 'General Remodel',
        budget_min: '',
        budget_max: '',
        location: '',
        timeline_days: '30',
      });
      setStatus('Project posted. Contractors can now submit bids.');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Could not create project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="glass-card p-5 space-y-4">
      <div>
        <h3 className="font-outfit font-semibold text-[#0F172A] text-lg">Post a project</h3>
        <p className="text-sm text-[#64748B] mt-1">
          Create a real homeowner project in the backend so contractors can bid on it.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          className={fieldClass}
          placeholder="Project title"
          value={form.title}
          onChange={(event) => update('title', event.target.value)}
          required
        />
        <input
          className={fieldClass}
          placeholder="Location"
          value={form.location}
          onChange={(event) => update('location', event.target.value)}
        />
        <select
          className={fieldClass}
          value={form.category}
          onChange={(event) => update('category', event.target.value)}
        >
          <option>General Remodel</option>
          <option>Kitchen Remodel</option>
          <option>Bathroom</option>
          <option>Roofing</option>
          <option>Flooring</option>
          <option>Electrical</option>
          <option>Plumbing</option>
          <option>Full Renovation</option>
          <option>New Construction</option>
        </select>
        <input
          className={fieldClass}
          type="number"
          min="1"
          placeholder="Timeline days"
          value={form.timeline_days}
          onChange={(event) => update('timeline_days', event.target.value)}
        />
        <input
          className={fieldClass}
          type="number"
          min="0"
          placeholder="Minimum budget"
          value={form.budget_min}
          onChange={(event) => update('budget_min', event.target.value)}
        />
        <input
          className={fieldClass}
          type="number"
          min="0"
          placeholder="Maximum budget"
          value={form.budget_max}
          onChange={(event) => update('budget_max', event.target.value)}
        />
      </div>

      <textarea
        className={fieldClass + ' min-h-[110px] resize-none'}
        placeholder="Describe the work, property condition, timing, and anything contractors should know."
        value={form.description}
        onChange={(event) => update('description', event.target.value)}
        required
      />

      {status && <p className="text-sm text-[#475569]">{status}</p>}

      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-semibold disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 55%, #00D4FF 100%)' }}
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        Create Project
      </button>
    </form>
  );
}

function BidComposer({ project, onSubmitted }: { project: GcscProject; onSubmitted: () => void }) {
  const [form, setForm] = useState({ amount: '', proposed_timeline_days: String(project.timeline_days || 30), message: '' });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setStatus('');
    try {
      await api.submitBid({
        project_id: project.id,
        amount: Number(form.amount || 0),
        proposed_timeline_days: Number(form.proposed_timeline_days || project.timeline_days || 30),
        message: form.message,
      });
      setStatus('Bid submitted. You can track it in My Bids.');
      setForm({ amount: '', proposed_timeline_days: String(project.timeline_days || 30), message: '' });
      onSubmitted();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Could not submit bid');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-4 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-3">
      <div>
        <h4 className="font-outfit font-semibold text-[#0F172A]">Submit a bid</h4>
        <p className="text-xs text-[#64748B] mt-1">Your proposal is saved to the backend and becomes visible to the homeowner.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          className={fieldClass}
          type="number"
          min="1"
          placeholder="Bid amount"
          value={form.amount}
          onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
          required
        />
        <input
          className={fieldClass}
          type="number"
          min="1"
          placeholder="Timeline days"
          value={form.proposed_timeline_days}
          onChange={(event) => setForm((current) => ({ ...current, proposed_timeline_days: event.target.value }))}
        />
      </div>
      <textarea
        className={fieldClass + ' min-h-[92px] resize-none'}
        placeholder="Explain your scope, materials approach, and milestone plan."
        value={form.message}
        onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
      />
      {status && <p className="text-sm text-[#475569]">{status}</p>}
      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-white text-sm font-semibold disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 100%)' }}
      >
        {saving ? <Loader2 size={15} className="animate-spin" /> : <Gavel size={15} />}
        Send Bid
      </button>
    </form>
  );
}

function MilestoneComposer({ escrow, onCreated }: { escrow: GcscEscrow; onCreated: () => void }) {
  const [form, setForm] = useState({ title: '', description: '', amount: '' });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setStatus('');
    try {
      await api.createMilestone(escrow.id, {
        title: form.title,
        description: form.description,
        amount: Number(form.amount || 0),
      });
      setForm({ title: '', description: '', amount: '' });
      setStatus('Milestone created.');
      onCreated();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Could not create milestone');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-3">
      <div>
        <h4 className="font-outfit font-semibold gradient-text">Add milestone</h4>
        <p className="text-xs text-[#64748B] mt-1">Split escrow work into clear payment checkpoints.</p>
      </div>
      <input
        className={fieldClass}
        placeholder="Milestone title"
        value={form.title}
        onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
        required
      />
      <input
        className={fieldClass}
        type="number"
        min="1"
        placeholder="Amount"
        value={form.amount}
        onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
        required
      />
      <textarea
        className={fieldClass + ' min-h-[82px] resize-none'}
        placeholder="Describe the acceptance criteria."
        value={form.description}
        onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
      />
      {status && <p className="text-sm text-[#475569]">{status}</p>}
      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-white text-xs font-semibold disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 100%)' }}
      >
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
        Add Milestone
      </button>
    </form>
  );
}

function MilestoneManager({
  escrow,
  milestones,
  user,
  onChanged,
}: {
  escrow: GcscEscrow;
  milestones: GcscMilestone[];
  user: GcscUser;
  onChanged: () => void;
}) {
  const [status, setStatus] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [chainStatus, setChainStatus] = useState('');
  const [chainBusyId, setChainBusyId] = useState<string | null>(null);
  const [verifyBusyId, setVerifyBusyId] = useState<string | null>(null);
  const isHomeowner = user.role === 'homeowner';
  const isContractor = user.role === 'contractor';

  const runAction = async (milestoneId: number, action: 'submit' | 'approve' | 'release' | 'dispute') => {
    setBusyId(milestoneId);
    setStatus('');
    try {
      if (action === 'submit') await api.submitMilestone(milestoneId);
      if (action === 'approve') await api.approveMilestone(milestoneId);
      if (action === 'release') await api.releaseMilestone(milestoneId);
      if (action === 'dispute') await api.disputeMilestone(milestoneId);
      setStatus(`Milestone ${action} saved.`);
      onChanged();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Could not update milestone');
    } finally {
      setBusyId(null);
    }
  };

  const verifyChainTx = async (milestone: GcscMilestone, tx: GcscChainTx) => {
    setVerifyBusyId(tx.tx_id);
    setChainStatus('');
    try {
      const response = await api.verifyMilestoneChainTx(milestone.id, tx.tx_id);
      setChainStatus(`Transaction ${response.chain_tx.status}: ${tx.tx_id.slice(0, 12)}...`);
      onChanged();
    } catch (err) {
      setChainStatus(err instanceof Error ? err.message : 'Could not verify chain transaction');
    } finally {
      setVerifyBusyId(null);
    }
  };

  const signTestnetAction = async (milestone: GcscMilestone, action: EscrowMilestoneChainAction) => {
    const key = `${milestone.id}:${action}`;
    setChainBusyId(key);
    setChainStatus('');
    try {
      const result = await signEscrowMilestoneAction({
        action,
        escrowId: escrow.id,
        milestoneId: milestone.id,
        evidenceHash: milestone.description || milestone.title || `milestone-${milestone.id}`,
      });
      if (result.transactionId) {
        await api.recordMilestoneChainTx(milestone.id, {
          action: result.action,
          tx_id: result.transactionId,
          chain_id: result.chainId,
          contract_account: result.contractAccount,
          actor: result.wallet.accountName,
          status: 'broadcast',
        });
        onChanged();
      }
      const tx = result.transactionId ? ` Transaction: ${result.transactionId.slice(0, 12)}...` : '';
      setChainStatus(`Testnet action signed by ${result.wallet.accountName} and saved to audit trail.${tx}`);
    } catch (err) {
      setChainStatus(err instanceof Error ? err.message : 'Could not sign testnet escrow action');
    } finally {
      setChainBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h4 className="font-outfit font-semibold gradient-text">Milestones</h4>
          <p className="text-xs text-[#64748B] mt-1">
            Escrow #{escrow.id} - {formatCurrency(escrow.total_amount)} - {projectStatusLabel(escrow.status)}
          </p>
        </div>
        <StatusBadge status={projectStatusLabel(escrow.status)} />
      </div>

      {isHomeowner && escrow.status !== 'disputed' && escrow.status !== 'completed' && (
        <MilestoneComposer escrow={escrow} onCreated={onChanged} />
      )}

      {milestones.length === 0 ? (
        <p className="text-sm text-[#64748B]">No milestones yet.</p>
      ) : milestones.map((milestone) => {
        const label = milestoneStatusLabel(milestone.status);
        const canSubmit = isContractor && milestone.status === 'pending' && escrow.status !== 'disputed';
        const canApprove = isHomeowner && milestone.status === 'submitted' && escrow.status !== 'disputed';
        const canRelease = isHomeowner && milestone.status === 'approved' && escrow.status !== 'disputed';
        const canDispute = milestone.status !== 'released' && milestone.status !== 'disputed' && escrow.status !== 'completed';
        const canSignSubmit = isContractor && (milestone.status === 'pending' || milestone.status === 'submitted') && escrow.status !== 'disputed';
        const canSignApprove = isHomeowner && (milestone.status === 'submitted' || milestone.status === 'approved') && escrow.status !== 'disputed';
        const canSignRelease = isHomeowner && milestone.status === 'approved' && escrow.status !== 'disputed';
        const canSignDispute = canDispute;
        const chainTxs = milestone.chain_txs || [];
        const busy = busyId === milestone.id;

        return (
          <div key={milestone.id} className="rounded-2xl border border-[#E2E8F0] p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-[#0F172A]">{milestone.title}</p>
                <p className="text-xs text-[#64748B]">{formatCurrency(milestone.amount)}</p>
              </div>
              <StatusBadge status={label} />
            </div>
            {milestone.description && <p className="text-sm text-[#475569] leading-6">{milestone.description}</p>}
            {chainTxs.length > 0 && (
              <div className="rounded-xl border border-[#DBEAFE] bg-[#EFF6FF] p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#3B6BF7]">
                  On-chain audit trail
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {chainTxs.slice(0, 3).map((tx) => (
                    <span
                      key={tx.id}
                      className="inline-flex items-center gap-1.5 rounded-md bg-white border border-[#BFDBFE] px-2.5 py-1"
                    >
                      <a
                        href={`https://testnet.explorer.xprnetwork.org/transaction/${tx.tx_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#3B6BF7] hover:text-[#7B2FF7]"
                        title={tx.tx_id}
                      >
                        {tx.action.replace('milestone', '')}
                        <span className="text-[#64748B]">{tx.tx_id.slice(0, 8)}...</span>
                      </a>
                      <span
                        className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase"
                        style={{
                          color: tx.status === 'confirmed' ? '#10B981' : tx.status === 'failed' ? '#EF4444' : '#F59E0B',
                          backgroundColor: tx.status === 'confirmed'
                            ? 'rgba(16,185,129,0.12)'
                            : tx.status === 'failed'
                              ? 'rgba(239,68,68,0.12)'
                              : 'rgba(245,158,11,0.12)',
                        }}
                      >
                        {tx.status}
                      </span>
                      {tx.status === 'broadcast' && (
                        <button
                          type="button"
                          onClick={() => void verifyChainTx(milestone, tx)}
                          disabled={verifyBusyId === tx.tx_id}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#7B2FF7] disabled:opacity-60"
                        >
                          {verifyBusyId === tx.tx_id ? <Loader2 size={11} className="animate-spin" /> : <ShieldCheck size={11} />}
                          Verify Tx
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {canSubmit && (
                <button
                  onClick={() => void runAction(milestone.id, 'submit')}
                  disabled={busy}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold text-white disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 100%)' }}
                >
                  {busy ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                  Submit
                </button>
              )}
              {canApprove && (
                <button
                  onClick={() => void runAction(milestone.id, 'approve')}
                  disabled={busy}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold text-white disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #3B6BF7 0%, #00D4FF 100%)' }}
                >
                  {busy ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                  Approve
                </button>
              )}
              {canRelease && (
                <button
                  onClick={() => void runAction(milestone.id, 'release')}
                  disabled={busy}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold text-white disabled:opacity-60"
                  style={{ background: '#10B981' }}
                >
                  {busy ? <Loader2 size={12} className="animate-spin" /> : <DollarSign size={12} />}
                  Release
                </button>
              )}
              {canDispute && (
                <button
                  onClick={() => void runAction(milestone.id, 'dispute')}
                  disabled={busy}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold bg-[#FEF2F2] text-[#EF4444] disabled:opacity-60"
                >
                  {busy ? <Loader2 size={12} className="animate-spin" /> : <AlertTriangle size={12} />}
                  Dispute
                </button>
              )}
            </div>
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7B2FF7]">
                Testnet signing only
              </p>
              <p className="text-xs text-[#64748B] mt-1">
                WebAuth can sign the matching gcscrow1111 action on XPR testnet. Backend status changes stay separate.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {canSignSubmit && (
                  <button
                    onClick={() => void signTestnetAction(milestone, 'submitmilestone')}
                    disabled={chainBusyId === `${milestone.id}:submitmilestone`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold bg-white text-[#7B2FF7] border border-[#C4B5FD] disabled:opacity-60"
                  >
                    {chainBusyId === `${milestone.id}:submitmilestone` ? <Loader2 size={12} className="animate-spin" /> : <PlugZap size={12} />}
                    Sign Testnet Submit
                  </button>
                )}
                {canSignApprove && (
                  <button
                    onClick={() => void signTestnetAction(milestone, 'approvemilestone')}
                    disabled={chainBusyId === `${milestone.id}:approvemilestone`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold bg-white text-[#3B6BF7] border border-[#BFDBFE] disabled:opacity-60"
                  >
                    {chainBusyId === `${milestone.id}:approvemilestone` ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                    Sign Testnet Approve
                  </button>
                )}
                {canSignRelease && (
                  <button
                    onClick={() => void signTestnetAction(milestone, 'releasemilestone')}
                    disabled={chainBusyId === `${milestone.id}:releasemilestone`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold bg-white text-[#10B981] border border-[#A7F3D0] disabled:opacity-60"
                  >
                    {chainBusyId === `${milestone.id}:releasemilestone` ? <Loader2 size={12} className="animate-spin" /> : <DollarSign size={12} />}
                    Sign Testnet Release
                  </button>
                )}
                {canSignDispute && (
                  <button
                    onClick={() => void signTestnetAction(milestone, 'disputemilestone')}
                    disabled={chainBusyId === `${milestone.id}:disputemilestone`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold bg-white text-[#EF4444] border border-[#FECACA] disabled:opacity-60"
                  >
                    {chainBusyId === `${milestone.id}:disputemilestone` ? <Loader2 size={12} className="animate-spin" /> : <AlertTriangle size={12} />}
                    Sign Testnet Dispute
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {status && <p className="text-sm text-[#475569]">{status}</p>}
      {chainStatus && <p className="text-sm text-[#475569]">{chainStatus}</p>}
    </div>
  );
}

function ProjectsPanel({ user }: { user: GcscUser }) {
  const [filter, setFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [projects, setProjects] = useState<GcscProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<GcscProject | null>(null);
  const [selectedBids, setSelectedBids] = useState<GcscBid[]>([]);
  const [selectedEscrow, setSelectedEscrow] = useState<GcscEscrow | null>(null);
  const [selectedMilestones, setSelectedMilestones] = useState<GcscMilestone[]>([]);
  const [biddingProjectId, setBiddingProjectId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');
  const [detailMessage, setDetailMessage] = useState('');
  const isHomeowner = user.role === 'homeowner';

  const loadProjects = async () => {
    setLoading(true);
    setError('');
    try {
      if (isHomeowner) {
        const response = await api.getMyProjects();
        setProjects(response.projects || []);
      } else {
        const [openResponse, myResponse] = await Promise.all([
          api.getProjects({ status: 'open' }),
          api.getMyProjects(),
        ]);
        const merged = new Map<number, GcscProject>();
        for (const project of [...(openResponse.projects || []), ...(myResponse.projects || [])]) {
          merged.set(project.id, project);
        }
        setProjects([...merged.values()]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProjects();
  }, [user.id, user.role]);

  const loadDetails = async (projectId: number) => {
    setDetailLoading(true);
    setDetailMessage('');
    try {
      const response = await api.getProject(projectId);
      setSelectedProject(response.project);
      setSelectedBids(response.bids || []);
      setSelectedEscrow(null);
      setSelectedMilestones([]);
      if (response.project?.escrow_id) {
        const escrowResponse = await api.getEscrow(response.project.escrow_id);
        setSelectedEscrow(escrowResponse.escrow);
        setSelectedMilestones(escrowResponse.milestones || []);
      }
    } catch (err) {
      setDetailMessage(err instanceof Error ? err.message : 'Could not load project details');
    } finally {
      setDetailLoading(false);
    }
  };

  const acceptBid = async (bidId: number) => {
    if (!selectedProject) return;
    setDetailMessage('');
    try {
      await api.acceptBid(bidId);
      setDetailMessage('Bid accepted. Escrow record created.');
      await Promise.all([loadDetails(selectedProject.id), loadProjects()]);
    } catch (err) {
      setDetailMessage(err instanceof Error ? err.message : 'Could not accept bid');
    }
  };

  const onProjectCreated = (project: GcscProject) => {
    setProjects((current) => [project, ...current]);
    setSelectedProject(project);
    setSelectedBids([]);
    setSelectedEscrow(null);
    setSelectedMilestones([]);
  };

  const filtered = useMemo(() => {
    return projects.filter((project) => {
      const label = projectStatusLabel(project.status);
      const matchesFilter = filter === 'All' || label === filter;
      const q = search.toLowerCase().trim();
      const matchesSearch = !q || [project.title, project.category, project.location, String(project.id)]
        .filter(Boolean)
        .some((item) => item.toLowerCase().includes(q));
      return matchesFilter && matchesSearch;
    });
  }, [filter, search, projects]);

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
            {isHomeowner ? 'My Projects' : 'Open Projects'}
          </h2>
          <p className="font-inter text-sm text-[#475569] mt-1">
            {isHomeowner
              ? 'Create project requests, review contractor bids, and move accepted work into escrow.'
              : 'Review homeowner requests and submit real bids through the backend API.'}
          </p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9 pr-4 py-2 rounded-lg border border-[#E2E8F0] bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#7B2FF7]/30 focus:border-[#7B2FF7] transition-all w-full sm:w-[240px]"
          />
        </div>
      </div>

      {isHomeowner && <ProjectRequestForm onCreated={onProjectCreated} />}

      <div className="flex items-center gap-2 flex-wrap">
        {(['All', 'Open', 'In Progress', 'Completed', 'Cancelled'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className="px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
            style={{
              backgroundColor: filter === status ? '#7B2FF7' : '#F1F5F9',
              color: filter === status ? '#FFFFFF' : '#475569',
            }}
          >
            {status}
          </button>
        ))}
        <div className="ml-auto text-sm text-[#475569]">
          <SlidersHorizontal size={16} className="inline mr-1" />
          {filtered.length} project{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {error && <div className="glass-card p-4 text-sm text-[#EF4444]">{error}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_0.95fr] gap-6">
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th className="text-left px-4 py-3 font-semibold text-[#0F172A] text-xs uppercase tracking-wider">Project</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#0F172A] text-xs uppercase tracking-wider">Category</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#0F172A] text-xs uppercase tracking-wider">Location</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#0F172A] text-xs uppercase tracking-wider">Budget</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#0F172A] text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#0F172A] text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-[#64748B]">
                      <Loader2 size={18} className="animate-spin inline mr-2" /> Loading projects...
                    </td>
                  </tr>
                ) : filtered.map((project) => {
                  const label = projectStatusLabel(project.status);
                  return (
                    <tr key={project.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC]/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[#0F172A]">{project.title}</div>
                        <div className="font-mono text-xs text-[#3B6BF7]">#{project.id}</div>
                      </td>
                      <td className="px-4 py-3 text-[#475569]">{project.category || 'General'}</td>
                      <td className="px-4 py-3 text-[#475569]">{project.location || 'Not set'}</td>
                      <td className="px-4 py-3 font-medium text-[#0F172A]">
                        {formatCurrency(project.budget_min || 0)} - {formatCurrency(project.budget_max || 0)}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={label} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => void loadDetails(project.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0] hover:text-[#0F172A] transition-colors"
                          >
                            <Eye size={12} /> View
                          </button>
                          {!isHomeowner && project.status === 'open' && (
                            <button
                              onClick={() => {
                                setBiddingProjectId(project.id);
                                setSelectedProject(project);
                                setSelectedBids([]);
                                setSelectedEscrow(null);
                                setSelectedMilestones([]);
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium text-white transition-all hover:scale-[1.04]"
                              style={{ background: 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 100%)' }}
                            >
                              <Gavel size={12} /> Bid
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!loading && filtered.length === 0 && (
            <div className="text-center py-12 text-[#94A3B8]">
              {isHomeowner ? 'No projects yet. Create the first one above.' : 'No open projects are available right now.'}
            </div>
          )}
        </div>

        <aside className="glass-card p-5 min-h-[320px]">
          {detailLoading ? (
            <div className="h-full flex items-center justify-center text-[#64748B]">
              <Loader2 size={18} className="animate-spin mr-2" /> Loading details...
            </div>
          ) : selectedProject ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider gradient-text">Selected Project</p>
                <h3 className="font-outfit font-bold text-xl text-[#0F172A] mt-1">{selectedProject.title}</h3>
                <p className="text-sm text-[#64748B] mt-2 leading-6">{selectedProject.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-[#F8FAFC] p-3">
                  <p className="text-xs text-[#94A3B8]">Timeline</p>
                  <p className="font-semibold text-[#0F172A]">{selectedProject.timeline_days || 30} days</p>
                </div>
                <div className="rounded-xl bg-[#F8FAFC] p-3">
                  <p className="text-xs text-[#94A3B8]">Status</p>
                  <p className="font-semibold text-[#0F172A]">{projectStatusLabel(selectedProject.status)}</p>
                </div>
              </div>

              {isHomeowner ? (
                <div className="space-y-3">
                  <h4 className="font-outfit font-semibold text-[#0F172A]">Contractor bids</h4>
                  {selectedBids.length === 0 ? (
                    <p className="text-sm text-[#64748B]">No bids yet.</p>
                  ) : selectedBids.map((bid) => {
                    const label = bidStatusLabel(bid.status);
                    return (
                      <div key={bid.id} className="rounded-2xl border border-[#E2E8F0] p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-[#0F172A]">{formatCurrency(bid.amount)}</p>
                            <p className="text-xs text-[#64748B]">Contractor #{bid.contractor_id} - {bid.proposed_timeline_days || 30} days</p>
                          </div>
                          <StatusBadge status={label} />
                        </div>
                        {bid.message && <p className="text-sm text-[#475569] leading-6">{bid.message}</p>}
                        {bid.status === 'pending' && selectedProject.status === 'open' && (
                          <button
                            onClick={() => void acceptBid(bid.id)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-xs font-semibold"
                            style={{ background: 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 100%)' }}
                          >
                            <CheckCircle2 size={14} /> Accept and Create Escrow
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : biddingProjectId === selectedProject.id ? (
                <BidComposer project={selectedProject} onSubmitted={() => void loadProjects()} />
              ) : (
                <button
                  onClick={() => setBiddingProjectId(selectedProject.id)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-semibold"
                  style={{ background: 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 100%)' }}
                >
                  <Gavel size={15} /> Prepare Bid
                </button>
              )}

              {selectedEscrow && (
                <MilestoneManager
                  escrow={selectedEscrow}
                  milestones={selectedMilestones}
                  user={user}
                  onChanged={() => void loadDetails(selectedProject.id)}
                />
              )}

              {detailMessage && <p className="text-sm text-[#475569]">{detailMessage}</p>}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-[#64748B] py-10">
              <ClipboardList size={32} className="text-[#94A3B8] mb-3" />
              <p className="font-semibold text-[#0F172A]">Select a project</p>
              <p className="text-sm mt-1">Project details, bids, and escrow actions appear here.</p>
            </div>
          )}
        </aside>
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

function BidsPanel({ user }: { user: GcscUser }) {
  const [filter, setFilter] = useState<string>('All');
  const [bids, setBids] = useState<GcscBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isContractor = user.role === 'contractor';

  const loadBids = async () => {
    if (!isContractor) {
      setBids([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await api.getMyBids();
      setBids(response.bids || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load bids');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBids();
  }, [user.id, user.role]);

  const filtered = useMemo(() => {
    if (filter === 'All') return bids;
    return bids.filter((bid) => bidStatusLabel(bid.status) === filter);
  }, [filter, bids]);

  if (!isContractor) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className="space-y-6"
      >
        <div>
          <h2 className="font-outfit font-bold text-[1.5rem] text-[#0F172A]">Bids</h2>
          <p className="font-inter text-sm text-[#475569] mt-1">
            Homeowner bids are managed inside each project detail panel.
          </p>
        </div>
        <div className="glass-card p-8 text-center text-[#64748B]">
          <ClipboardList size={34} className="mx-auto text-[#94A3B8] mb-3" />
          <p className="font-semibold text-[#0F172A]">Open My Projects to review contractor bids.</p>
          <p className="text-sm mt-1">Accepting a bid creates the escrow record through the backend.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-outfit font-bold text-[1.5rem] text-[#0F172A]">My Bids</h2>
          <p className="font-inter text-sm text-[#475569] mt-1">
            Track contractor proposals submitted through the real API.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {(['All', 'Submitted', 'Accepted', 'Declined'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className="px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
            style={{
              backgroundColor: filter === status ? '#7B2FF7' : '#F1F5F9',
              color: filter === status ? '#FFFFFF' : '#475569',
            }}
          >
            {status}
          </button>
        ))}
        <div className="ml-auto text-sm text-[#475569]">
          {filtered.length} bid{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {error && <div className="glass-card p-4 text-sm text-[#EF4444]">{error}</div>}

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <th className="text-left px-4 py-3 font-semibold text-[#0F172A] text-xs uppercase tracking-wider">Bid ID</th>
                <th className="text-left px-4 py-3 font-semibold text-[#0F172A] text-xs uppercase tracking-wider">Project</th>
                <th className="text-left px-4 py-3 font-semibold text-[#0F172A] text-xs uppercase tracking-wider">Bid Amount</th>
                <th className="text-left px-4 py-3 font-semibold text-[#0F172A] text-xs uppercase tracking-wider">Timeline</th>
                <th className="text-left px-4 py-3 font-semibold text-[#0F172A] text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-[#0F172A] text-xs uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-[#64748B]">
                    <Loader2 size={18} className="animate-spin inline mr-2" /> Loading bids...
                  </td>
                </tr>
              ) : filtered.map((bid) => {
                const label = bidStatusLabel(bid.status);
                return (
                  <tr key={bid.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC]/60 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[#3B6BF7] font-medium">#{bid.id}</td>
                    <td className="px-4 py-3 font-medium text-[#0F172A]">Project #{bid.project_id}</td>
                    <td className="px-4 py-3 font-semibold text-[#0F172A]">{formatCurrency(bid.amount)}</td>
                    <td className="px-4 py-3 text-[#475569]">{bid.proposed_timeline_days || 30} days</td>
                    <td className="px-4 py-3"><StatusBadge status={label} /></td>
                    <td className="px-4 py-3 text-[#475569]">{formatDate(bid.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-[#94A3B8]">
            No bids match your filter. Open Projects and submit your first proposal.
          </div>
        )}
      </div>
    </motion.div>
  );
}

type AccountRole = 'contractor' | 'homeowner';

const fieldClass =
  'w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#7B2FF7]/30 focus:border-[#7B2FF7] transition-all';

const profileFieldLabels: Record<string, string> = {
  fullName: 'Full name',
  phone: 'Phone',
  companyName: 'Company name',
  ein: 'EIN',
  licenseNumber: 'License number',
  serviceArea: 'Service area',
  specialties: 'Specialties',
  propertyAddress: 'Property address',
  propertyType: 'Property type',
  budgetRange: 'Budget range',
  projectNeeds: 'Project needs',
  city: 'City',
  state: 'State',
};

const complianceStatusCopy: Record<string, { label: string; tone: string }> = {
  profile_incomplete: { label: 'Profile incomplete', tone: '#F59E0B' },
  documents_missing: { label: 'Documents missing', tone: '#F59E0B' },
  pending_review: { label: 'Pending review', tone: '#3B6BF7' },
  wallet_missing: { label: 'Wallet missing', tone: '#7B2FF7' },
  verified: { label: 'Verified', tone: '#10B981' },
  rejected: { label: 'Needs correction', tone: '#EF4444' },
};

function formatFileSize(bytes: number) {
  if (!bytes) return '0 KB';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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

function getLocalProfileCompletion(user: GcscUser) {
  const profile = getProfile(user);
  const required = user.role === 'contractor'
    ? ['fullName', 'phone', 'companyName', 'ein', 'licenseNumber', 'serviceArea', 'specialties']
    : ['fullName', 'phone', 'propertyAddress', 'propertyType', 'budgetRange', 'projectNeeds', 'city', 'state'];
  const missing = required.filter((field) => {
    if (field === 'fullName') return !(user.fullName || user.full_name);
    if (field === 'phone') return !user.phone;
    if (field === 'specialties') return !profile.specialties?.length;
    return !String(profile[field as keyof GcscProfile] || '').trim();
  });

  return {
    percent: Math.round(((required.length - missing.length) / required.length) * 100),
    completed: missing.length === 0,
    missing,
    required,
  };
}

function profileFieldLabel(field: string) {
  return profileFieldLabels[field] || field;
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
  const completion = user.profile_completion || getLocalProfileCompletion(user);

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
      setProfile(getProfile(response.user));
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

      <div className="glass-card p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider gradient-text">Profile completeness</p>
            <h3 className="font-outfit font-bold text-[1.25rem] gradient-text mt-1">
              {completion.completed ? 'Profile ready for review' : 'Finish your account details'}
            </h3>
          </div>
          <div className="text-left md:text-right">
            <p className="font-outfit font-bold text-[2rem] gradient-text">{completion.percent}%</p>
            <p className="text-xs text-[#64748B]">Saved through backend profile storage</p>
          </div>
        </div>
        <div className="mt-4 h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${completion.percent}%`,
              background: 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 55%, #00D4FF 100%)',
            }}
          />
        </div>
        {!completion.completed && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-[#7B2FF7] uppercase tracking-wider">Missing profile data</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {completion.missing.map((field) => (
                <span key={field} className="px-3 py-1 rounded-full bg-[rgba(123,47,247,0.08)] text-xs font-semibold text-[#7B2FF7]">
                  {profileFieldLabel(field)}
                </span>
              ))}
            </div>
          </div>
        )}
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

/* ---- Compliance Panel ---- */

function CompliancePanel({ user }: { user: GcscUser }) {
  const [compliance, setCompliance] = useState<GcscCompliance | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingType, setUploadingType] = useState('');
  const [status, setStatus] = useState('');
  const isContractor = user.role === 'contractor';

  const loadCompliance = async () => {
    setLoading(true);
    try {
      const response = await api.getCompliance();
      setCompliance(response);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Could not load compliance status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompliance();
  }, [user.id]);

  const uploadDocument = async (document: GcscRequiredDocument, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > 1500000) {
      setStatus('Document file is too large. Please use a PDF or image under 1.5MB.');
      return;
    }

    setUploadingType(document.document_type);
    setStatus('');
    try {
      const fileDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Could not read selected file'));
        reader.readAsDataURL(file);
      });
      const response = await api.submitDocument({
        documentType: document.document_type,
        fileName: file.name,
        mimeType: file.type || 'application/pdf',
        fileDataUrl,
      });
      setCompliance(response.compliance);
      setStatus(`${document.label} submitted for review.`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Could not submit document');
    } finally {
      setUploadingType('');
    }
  };

  const summary = complianceStatusCopy[compliance?.overall_status || 'profile_incomplete'];
  const requiredDocuments = compliance?.required_documents || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="space-y-6"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider gradient-text">Contractor Verification</p>
        <h2 className="font-outfit font-bold text-[1.5rem] gradient-text mt-1">Compliance Checklist</h2>
        <p className="font-inter text-sm text-[#475569] mt-1">
          Upload real contractor documents for profile review before bids become trust-ready.
        </p>
      </div>

      <div className="glass-card p-6">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-[#64748B]">
            <Loader2 size={16} className="animate-spin" />
            Loading compliance status...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7B2FF7] via-[#3B6BF7] to-[#00D4FF] flex items-center justify-center mb-4">
                <ShieldCheck size={26} className="text-white" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#7B2FF7]">Verification status</p>
              <h3 className="font-outfit font-bold text-[1.75rem] gradient-text mt-1">
                {summary?.label || 'Profile incomplete'}
              </h3>
              <p className="text-sm text-[#475569] mt-3 leading-6">
                {isContractor
                  ? 'Profile data, required documents, and WebAuth wallet connection are checked together.'
                  : 'Owner accounts currently use profile and wallet checks. Contractor document review is not required for owners.'}
              </p>
              {compliance && (
                <div className="mt-5 h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${compliance.profile_completion.percent}%`,
                      background: 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 55%, #00D4FF 100%)',
                    }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-3">
              {(compliance?.checklist || []).map((item) => (
                <div key={item.key} className="flex items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {item.completed ? <CheckCircle2 size={18} className="text-[#10B981] shrink-0" /> : <Clock4 size={18} className="text-[#F59E0B] shrink-0" />}
                    <span className="text-sm font-semibold text-[#0F172A] truncate">{item.label}</span>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: item.completed ? '#10B981' : '#F59E0B' }}>
                    {item.completed ? 'done' : (item.status || 'needed')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isContractor && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h3 className="font-outfit font-bold text-[1.25rem] gradient-text">Required Documents</h3>
              <p className="text-sm text-[#64748B] mt-1">PDF, PNG, JPG, or WEBP under 1.5MB per document.</p>
            </div>
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
              style={{ color: summary?.tone || '#7B2FF7', backgroundColor: 'rgba(123,47,247,0.08)' }}
            >
              {summary?.label || 'Review'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {requiredDocuments.map((document) => {
              const isUploading = uploadingType === document.document_type;
              const uploaded = document.document;
              return (
                <div key={document.document_type} className="rounded-xl border border-[#E2E8F0] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-outfit font-bold text-[#0F172A]">{document.label}</p>
                      <p className="text-xs text-[#64748B] mt-1">
                        {uploaded ? `${uploaded.file_name} - ${formatFileSize(uploaded.file_size)}` : 'No file submitted'}
                      </p>
                    </div>
                    {document.status === 'approved' ? (
                      <CheckCircle2 size={18} className="text-[#10B981] shrink-0" />
                    ) : document.status === 'rejected' ? (
                      <XCircle size={18} className="text-[#EF4444] shrink-0" />
                    ) : (
                      <Clock4 size={18} className="text-[#F59E0B] shrink-0" />
                    )}
                  </div>
                  {uploaded?.file_sha256 && (
                    <p className="mt-3 text-[0.7rem] text-[#94A3B8] break-all">SHA-256: {uploaded.file_sha256.slice(0, 18)}...</p>
                  )}
                  {uploaded?.review_note && (
                    <p className="mt-3 text-xs text-[#64748B]">{uploaded.review_note}</p>
                  )}
                  <label className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#C4B5FD] px-4 py-2 text-sm font-semibold text-[#7B2FF7] cursor-pointer hover:bg-[rgba(123,47,247,0.06)] transition-colors">
                    {isUploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                    {uploaded ? 'Replace file' : 'Upload file'}
                    <input
                      type="file"
                      accept="application/pdf,image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(event) => uploadDocument(document, event)}
                      disabled={isUploading}
                    />
                  </label>
                </div>
              );
            })}
          </div>
          {status && <p className={`text-sm mt-4 ${status.includes('submitted') ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>{status}</p>}
        </div>
      )}
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
    if (!user) return null;

    switch (activeSection) {
      case 'projects':
        return <ProjectsPanel user={user} />;
      case 'estimator':
        return <EstimatorPanel />;
      case 'bids':
        return <BidsPanel user={user} />;
      case 'profile':
        return user ? <ProfilePanel user={user} onUserChange={setUser} /> : null;
      case 'compliance':
        return <CompliancePanel user={user} />;
      case 'wallet':
        return user ? <WalletPanel user={user} onUserChange={setUser} /> : null;
      case 'token':
        return <TokenRedirect />;
      default:
        return <ProjectsPanel user={user} />;
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
