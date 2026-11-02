import { useState } from 'react';
import { Search, Loader2, Sparkles, AlertCircle, ExternalLink } from 'lucide-react';

type LevitonSource = { title: string; url: string };
type LevitonStatus = 'idle' | 'loading' | 'ready' | 'setup';

const SEED_QUESTIONS = [
  'How do I compare contractor estimates for the same job?',
  'What is staged escrow and how does it protect me?',
  'What should a kitchen remodel estimate include?',
];

export function LevitonPanel() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<LevitonStatus>('idle');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<LevitonSource[]>([]);

  const ask = async (q: string) => {
    const text = q.trim();
    if (!text || status === 'loading') return;
    setQuery(text);
    setStatus('loading');
    setAnswer('');
    setSources([]);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const token = localStorage.getItem('gcsc_auth_token');
      const res = await fetch('/api/leviton/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query: text }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!res.ok) {
        setStatus('setup');
        return;
      }
      const data = await res.json();
      if (typeof data?.answer !== 'string' || !data.answer.trim()) {
        setStatus('setup');
        return;
      }
      setAnswer(data.answer);
      setSources(Array.isArray(data.sources) ? data.sources.filter((s) => s && s.url) : []);
      setStatus('ready');
    } catch {
      clearTimeout(timer);
      setStatus('setup');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-outfit font-bold text-[1.5rem] text-white flex items-center gap-2">
          <Sparkles size={24} className="text-[#7B2FF7]" />
          Leviton — AI search for construction only
        </h2>
        <p className="font-inter text-sm text-[#A9BCD6] mt-1">
          Ask in plain words about remodeling, materials, estimates, or escrow. Leviton answers
          construction questions only. Prices and responsibility always stay with the contractor —
          Leviton never sends, pays, or changes anything on its own.
        </p>
      </div>

      <form
        className="glass-card p-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          ask(query);
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask about construction in plain words…"
          className="flex-1 px-4 py-2.5 rounded-lg border border-[#22315E] bg-[#020612] text-sm text-white placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#3B6BF7]/30 focus:border-[#3B6BF7] transition-all"
        />
        <button
          type="submit"
          disabled={status === 'loading' || !query.trim()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 100%)' }}
        >
          {status === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          Ask
        </button>
      </form>

      <div className="flex gap-2 flex-wrap">
        {SEED_QUESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => ask(q)}
            className="px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 text-[#A9BCD6] hover:text-white"
            style={{ backgroundColor: '#12224F' }}
          >
            {q}
          </button>
        ))}
      </div>

      {status === 'loading' && (
        <div className="glass-card p-6 flex items-center gap-3 text-[#A9BCD6] text-sm">
          <Loader2 size={18} className="animate-spin text-[#7B2FF7]" />
          Leviton is searching…
        </div>
      )}

      {status === 'setup' && (
        <div className="rounded-2xl border border-[#7C5A10] bg-[rgba(120,80,0,0.25)] p-4 text-sm text-[#FCD34D] leading-6">
          <p className="font-semibold flex items-center gap-2">
            <AlertCircle size={16} />
            Leviton search is still being connected
          </p>
          <p className="mt-1">
            Live search needs the server endpoint and a Perplexity API key, which are not connected
            yet. Nothing here is a made-up answer — Leviton shows results only from a real search.
            Meanwhile, use the Ask AI button: it already works on your real cabinet data.
          </p>
        </div>
      )}

      {status === 'ready' && (
        <div className="glass-card p-6 space-y-4">
          <p className="text-sm text-white leading-7 whitespace-pre-wrap">{answer}</p>
          {sources.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#A9BCD6] mb-2">Sources</p>
              <ul className="space-y-1.5">
                {sources.map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-[#A78BFA] hover:text-[#3B6BF7] inline-flex items-center gap-1"
                    >
                      {s.title || s.url}
                      <ExternalLink size={13} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
