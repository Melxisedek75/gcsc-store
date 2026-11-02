import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  Copy,
  Check,
  ArrowRight,
  FileText,
  Scale,
  ShieldCheck,
  Landmark,
  ListChecks,
} from 'lucide-react';
import { api, type GcscUser } from '../../services/api';
import type { Section } from './types';

type AgentView = 'home' | 'draft' | 'compare' | 'escrow' | 'financing' | 'compliance' | 'next';

type WorkspaceState = {
  status: 'idle' | 'loading' | 'loaded' | 'error';
  projects: number;
  bids: number;
};

function toList(raw: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(raw)) return raw as Array<Record<string, unknown>>;
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.projects)) return obj.projects as Array<Record<string, unknown>>;
    if (Array.isArray(obj.data)) return obj.data as Array<Record<string, unknown>>;
    if (Array.isArray(obj.items)) return obj.items as Array<Record<string, unknown>>;
  }
  return [];
}

const DRAFT_TEMPLATE = [
  'Project request draft',
  'What I want: [describe in plain words, e.g. new kitchen]',
  'Location: [city, ZIP]',
  'Photos: [attach photos of the space]',
  'Budget range: [from - to]',
  'Timeline: [when you want it done]',
  '',
  'Note: this draft only describes the job. Price and responsibility are set by the contractor, not by the draft.',
].join('\n');

const ESCROW_TEXT =
  'Money moves only in stages. Each payment matches work that is done, checked, and approved by you. ' +
  'No payment is released for work that exists only as a promise, and nothing moves without your approval.';

const COMPARE_TEXT =
  'Compare proposals for the same job, not five estimates for five different jobs. ' +
  'One clear request means every contractor prices the same scope, so the numbers are actually comparable.';

const FINANCING_TEXT =
  'Financing is explored before work begins, so you know the options early. ' +
  'A financing plan is not an approval — approval comes from the lender.';

const COMPLIANCE_TEXT =
  'Licensed, bonded, and insured contractors only. Documents and licenses live in one place, ' +
  'so every step of the job is verifiable instead of promised.';

const JOURNEY_STEPS = [
  'Photos and plain words',
  'One clear request',
  'Compare proposals',
  'Choose a contractor',
  'Materials and financing',
  'Staged payments',
  'Track and check work',
  'Finished home',
];

function displayName(user: GcscUser | null): string {
  if (!user) return 'there';
  return user.fullName || user.full_name || user.email || 'there';
}

export default function AiAgent({
  user,
  onNavigate,
  open,
  onOpenChange,
}: {
  user: GcscUser | null;
  onNavigate: (section: Section) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [showWelcome, setShowWelcome] = useState(false);
  const [view, setView] = useState<AgentView>('home');
  const [workspace, setWorkspace] = useState<WorkspaceState>({ status: 'idle', projects: 0, bids: 0 });
  const [copied, setCopied] = useState(false);
  const [askInput, setAskInput] = useState('');
  const [askNote, setAskNote] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (!localStorage.getItem('gcsc_ai_welcome_seen')) setShowWelcome(true);
    } catch {
      setShowWelcome(true);
    }
  }, []);

  const dismissWelcome = () => {
    try {
      localStorage.setItem('gcsc_ai_welcome_seen', '1');
    } catch {
      /* storage unavailable — welcome will show again, harmless */
    }
    setShowWelcome(false);
  };

  const loadWorkspace = async () => {
    if (workspace.status === 'loading' || workspace.status === 'loaded') return;
    setWorkspace((w) => ({ ...w, status: 'loading' }));
    try {
      const [projectsRaw, bidsRaw] = await Promise.all([api.getMyProjects(), api.getMyBids()]);
      setWorkspace({ status: 'loaded', projects: toList(projectsRaw).length, bids: toList(bidsRaw).length });
    } catch {
      setWorkspace({ status: 'error', projects: 0, bids: 0 });
    }
  };

  useEffect(() => {
    if (open) void loadWorkspace();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open ]);

  const go = (section: Section) => {
    onNavigate(section);
    onOpenChange(false);
  };

  const openView = (next: AgentView) => {
    setView(next);
    setAskNote(null);
  };

  const ask = () => {
    const q = askInput.trim().toLowerCase();
    if (!q) return;
    if (/(request|project|draft|kitchen|remodel|bath|siding|window|door)/.test(q)) {
      openView('draft');
      setAskNote('Showing: project request draft. Nothing was changed.');
    } else if (/(bid|proposal|compare|estimate)/.test(q)) {
      openView('compare');
      setAskNote('Showing: how to compare proposals. Nothing was changed.');
    } else if (/(escrow|payment|milestone|pay|deposit)/.test(q)) {
      openView('escrow');
      setAskNote('Showing: how staged payments work. Nothing was changed.');
    } else if (/(financ|loan|credit)/.test(q)) {
      openView('financing');
      setAskNote('Showing: financing options. Nothing was changed.');
    } else if (/(complian|document|license|insurance)/.test(q)) {
      openView('compliance');
      setAskNote('Showing: compliance and documents. Nothing was changed.');
    } else if (/(wallet|token)/.test(q)) {
      go('wallet');
    } else if (/(profile|account)/.test(q)) {
      go('profile');
    } else if (/(next|what|should|do|start)/.test(q)) {
      openView('next');
      setAskNote('Showing: your next step. Nothing was changed.');
    } else {
      setAskNote(
        'I can help with: drafting a request, comparing proposals, escrow, financing, compliance, or your next step. Pick one below.',
      );
    }
  };

  const copyDraft = async () => {
    try {
      await navigator.clipboard.writeText(DRAFT_TEMPLATE);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const nextStep = (): { title: string; text: string; action: string; onAction: () => void } => {
    if (workspace.status === 'loading' || workspace.status === 'idle') {
      return {
        title: 'Checking your workspace…',
        text: 'Loading your real projects and proposals to find the next step.',
        action: 'Wait a moment',
        onAction: () => undefined,
      };
    }
    if (workspace.status === 'error') {
      return {
        title: 'Start with one clear request',
        text: 'Your workspace could not be loaded right now, so start where every job starts: photos, plain words, one request.',
        action: 'Draft a request',
        onAction: () => openView('draft'),
      };
    }
    if (workspace.projects === 0) {
      return {
        title: 'Create your first request',
        text: 'No projects yet. Send photos and plain words, and the guide drafts one clear request for contractors to price.',
        action: 'Draft a request',
        onAction: () => openView('draft'),
      };
    }
    if (workspace.bids === 0) {
      return {
        title: 'Your request is live — next: proposals',
        text: `You have ${workspace.projects} project${workspace.projects === 1 ? '' : 's'} and no proposals yet. As proposals arrive, compare them on the same scope.`,
        action: 'Open proposals',
        onAction: () => go('bids'),
      };
    }
    return {
      title: 'Review your proposals',
      text: `You have ${workspace.projects} project${workspace.projects === 1 ? '' : 's'} and ${workspace.bids} proposal${workspace.bids === 1 ? '' : 's'}. Compare them on the same scope, then choose.`,
      action: 'Compare proposals',
      onAction: () => openView('compare'),
    };
  };

  const step = nextStep();
  const doneCount =
    workspace.status === 'loaded'
      ? (workspace.projects > 0 ? 2 : 0) + (workspace.bids > 0 ? 1 : 0)
      : 0;

  const seedButton = (label: string, target: AgentView) => (
    <button
      key={label}
      type="button"
      onClick={() => openView(target)}
      className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium text-white border border-[#22315E] bg-[#0A1633] hover:bg-[#12224F] transition-colors"
    >
      {label}
      <ArrowRight size={16} className="shrink-0 text-[#A9BCD6]" />
    </button>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setView('home');
          onOpenChange(true);
        }}
        aria-label="Open GCSC AI Guide"
        className="fixed bottom-5 right-5 z-40 h-14 w-14 rounded-full flex items-center justify-center text-white shadow-lg"
        style={{ background: 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 100%)', boxShadow: '0 8px 30px rgba(59,107,247,0.45)' }}
      >
        <span className="absolute inline-flex h-full w-full rounded-full bg-[#3B6BF7] opacity-30 animate-ping" />
        <Sparkles size={24} className="relative" />
      </button>

      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-4"
            onClick={dismissWelcome}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ duration: 0.35 }}
              className="w-full max-w-[480px] rounded-3xl border border-[#22315E] bg-[#0A1633] p-6 text-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 100%)' }}>
                    <Sparkles size={22} />
                  </div>
                  <div>
                    <p className="font-outfit font-bold text-lg leading-tight">Hi, {displayName(user)}!</p>
                    <p className="text-xs text-[#A9BCD6]">GCSC AI Guide — your journey assistant</p>
                  </div>
                </div>
                <button type="button" onClick={dismissWelcome} aria-label="Close welcome" className="p-1 text-[#A9BCD6] hover:text-white">
                  <X size={18} />
                </button>
              </div>
              <p className="mt-4 text-sm leading-6 text-[#C7D2E0]">
                Welcome to your cabinet. From the first photo to the finished home, everything lives here in one place —
                and I help with every step: one clear request, comparable proposals, staged payments, and tracking.
              </p>
              <div className="mt-5 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    dismissWelcome();
                    setView('draft');
                    onOpenChange(true);
                  }}
                  className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 100%)' }}
                >
                  Draft my first request
                </button>
                <button
                  type="button"
                  onClick={() => {
                    dismissWelcome();
                    setView('next');
                    onOpenChange(true);
                  }}
                  className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-white border border-[#22315E] bg-[#12224F]"
                >
                  Show my next step
                </button>
                <button
                  type="button"
                  onClick={dismissWelcome}
                  className="w-full px-4 py-2 text-sm font-medium text-[#A9BCD6] hover:text-white"
                >
                  Got it, explore on my own
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50"
            onClick={() => onOpenChange(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {open && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 bottom-0 z-[60] w-full max-w-[400px] bg-[#0A1633] border-l border-[#22315E] text-white flex flex-col"
            >
              <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[#22315E]">
                <div className="flex items-center gap-2.5">
                  <Sparkles size={20} className="text-[#8EA2FF]" />
                  <div>
                    <p className="font-outfit font-bold leading-tight">GCSC AI Guide</p>
                    <p className="text-[11px] text-[#A9BCD6]">Everything in one place, start to finish</p>
                  </div>
                </div>
                <button type="button" onClick={() => onOpenChange(false)} aria-label="Close AI Guide" className="p-1 text-[#A9BCD6] hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                <div>
                  <p className="text-sm leading-6 text-[#C7D2E0]">
                    Hi, {displayName(user)}! Ask in plain words, or pick a step — I never submit, pay, or change anything. You approve every step.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <input
                      value={askInput}
                      onChange={(e) => setAskInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') ask();
                      }}
                      placeholder="Ask in plain words…"
                      className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl bg-[#020612] border border-[#22315E] text-sm text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#3B6BF7]"
                    />
                    <button
                      type="button"
                      onClick={ask}
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white shrink-0"
                      style={{ background: 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 100%)' }}
                    >
                      Ask
                    </button>
                  </div>
                  {askNote && <p className="mt-2 text-xs leading-5 text-[#A9BCD6]">{askNote}</p>}
                </div>

                {view === 'home' && (
                  <>
                    <div className="rounded-2xl border border-[#22315E] bg-[#12224F] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#8EA2FF]">Your next step</p>
                      <p className="mt-2 font-outfit font-bold">{step.title}</p>
                      <p className="mt-1 text-sm leading-6 text-[#C7D2E0]">{step.text}</p>
                      <button
                        type="button"
                        onClick={step.onAction}
                        className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                        style={{ background: 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 100%)' }}
                      >
                        {step.action}
                        <ArrowRight size={16} />
                      </button>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#8EA2FF] mb-2">AI quick actions</p>
                      <div className="space-y-2">
                        {seedButton('Draft a project request', 'draft')}
                        {seedButton('Compare proposals', 'compare')}
                        {seedButton('How staged payments work', 'escrow')}
                        {seedButton('Financing options', 'financing')}
                        {seedButton('Compliance and documents', 'compliance')}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#8EA2FF] mb-2 flex items-center gap-2">
                        <ListChecks size={14} />
                        Your journey {workspace.status === 'loaded' ? `· ${doneCount} of ${JOURNEY_STEPS.length} done` : ''}
                      </p>
                      <div className="space-y-1.5">
                        {JOURNEY_STEPS.map((label, i) => {
                          const done = i < doneCount;
                          return (
                            <div key={label} className="flex items-center gap-2.5 text-sm">
                              <span
                                className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                                style={{
                                  background: done ? 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 100%)' : '#12224F',
                                  color: done ? '#FFFFFF' : '#A9BCD6',
                                  border: '1px solid #22315E',
                                }}
                              >
                                {done ? <Check size={13} /> : i + 1}
                              </span>
                              <span className={done ? 'text-white' : 'text-[#A9BCD6]'}>{label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                {view === 'draft' && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#8EA2FF] mb-2 flex items-center gap-2">
                      <FileText size={14} /> Project request draft
                    </p>
                    <p className="text-sm leading-6 text-[#C7D2E0] mb-3">
                      Fill in the brackets, then paste it into your project request. The guide drafts — the contractor prices.
                    </p>
                    <textarea readOnly value={DRAFT_TEMPLATE} rows={11} className="w-full px-3.5 py-3 rounded-xl bg-[#020612] border border-[#22315E] text-sm leading-6 text-white focus:outline-none resize-none" />
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={copyDraft}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                        style={{ background: 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 100%)' }}
                      >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? 'Copied' : 'Copy draft'}
                      </button>
                      <button
                        type="button"
                        onClick={() => go('projects')}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white border border-[#22315E] bg-[#12224F]"
                      >
                        Open Projects
                        <ArrowRight size={16} />
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-[#A9BCD6]">Receipt: draft shown, nothing submitted.</p>
                  </div>
                )}

                {view === 'compare' && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#8EA2FF] mb-2 flex items-center gap-2">
                      <Scale size={14} /> Compare proposals
                    </p>
                    <p className="text-sm leading-6 text-[#C7D2E0]">{COMPARE_TEXT}</p>
                    <button
                      type="button"
                      onClick={() => go('bids')}
                      className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                      style={{ background: 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 100%)' }}
                    >
                      Open proposals
                      <ArrowRight size={16} />
                    </button>
                  </div>
                )}

                {view === 'escrow' && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#8EA2FF] mb-2 flex items-center gap-2">
                      <ShieldCheck size={14} /> Staged payments
                    </p>
                    <p className="text-sm leading-6 text-[#C7D2E0]">{ESCROW_TEXT}</p>
                    <button
                      type="button"
                      onClick={() => go('projects')}
                      className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                      style={{ background: 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 100%)' }}
                    >
                      Open my projects
                      <ArrowRight size={16} />
                    </button>
                  </div>
                )}

                {view === 'financing' && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#8EA2FF] mb-2 flex items-center gap-2">
                      <Landmark size={14} /> Financing options
                    </p>
                    <p className="text-sm leading-6 text-[#C7D2E0]">{FINANCING_TEXT}</p>
                    <button
                      type="button"
                      onClick={() => go('loans')}
                      className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                      style={{ background: 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 100%)' }}
                    >
                      Explore financing
                      <ArrowRight size={16} />
                    </button>
                  </div>
                )}

                {view === 'compliance' && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#8EA2FF] mb-2 flex items-center gap-2">
                      <ShieldCheck size={14} /> Compliance and documents
                    </p>
                    <p className="text-sm leading-6 text-[#C7D2E0]">{COMPLIANCE_TEXT}</p>
                    <button
                      type="button"
                      onClick={() => go('compliance')}
                      className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                      style={{ background: 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 100%)' }}
                    >
                      Open compliance
                      <ArrowRight size={16} />
                    </button>
                  </div>
                )}

                {view === 'next' && (
                  <div className="rounded-2xl border border-[#22315E] bg-[#12224F] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#8EA2FF]">Your next step</p>
                    <p className="mt-2 font-outfit font-bold">{step.title}</p>
                    <p className="mt-1 text-sm leading-6 text-[#C7D2E0]">{step.text}</p>
                    <button
                      type="button"
                      onClick={step.onAction}
                      className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                      style={{ background: 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 100%)' }}
                    >
                      {step.action}
                      <ArrowRight size={16} />
                    </button>
                  </div>
                )}
              </div>

              <div className="px-5 py-3 border-t border-[#22315E] flex items-center justify-between gap-3">
                <button type="button" onClick={() => setView('home')} className="text-sm font-medium text-[#A9BCD6] hover:text-white">
                  Back to guide home
                </button>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      localStorage.removeItem('gcsc_ai_welcome_seen');
                    } catch {
                      /* ignore */
                    }
                    setShowWelcome(true);
                  }}
                  className="text-sm font-medium text-[#A9BCD6] hover:text-white"
                >
                  Show welcome again
                </button>
              </div>
            </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
