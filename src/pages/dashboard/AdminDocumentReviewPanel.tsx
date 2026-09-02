import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, ShieldCheck, Building2, CheckCircle2, XCircle } from 'lucide-react';
import { api, type GcscUserDocument } from '../../services/api';
import { complianceStatusCopy, documentTypeLabel, formatDate, formatFileSize } from './format';

type DocumentReviewFilter = '' | 'submitted' | 'approved' | 'rejected';

export function AdminDocumentReviewPanel() {
  const [documents, setDocuments] = useState<GcscUserDocument[]>([]);
  const [filter, setFilter] = useState<DocumentReviewFilter>('submitted');
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<number | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<number, string>>({});
  const [status, setStatus] = useState('');

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getAdminDocuments(filter);
      const list = Array.isArray(response?.documents) ? response.documents : [];
      setDocuments(list);
      setStatus(list.length ? '' : 'Queue is empty for this filter.');
    } catch (err) {
      setDocuments([]);
      setStatus(err instanceof Error ? err.message : 'Could not load submitted documents');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const reviewDocument = async (document: GcscUserDocument, reviewStatus: 'approved' | 'rejected') => {
    const manualNote = (reviewNotes[document.id] || '').trim();
    if (reviewStatus === 'rejected' && !manualNote) {
      setStatus('Manual note required when rejecting a document.');
      return;
    }

    setReviewingId(document.id);
    setStatus('');
    try {
      await api.reviewDocument(document.id, {
        status: reviewStatus,
        reviewNote: manualNote || 'Approved by admin review.',
      });
      await loadDocuments();
      setReviewNotes((current) => ({ ...current, [document.id]: '' }));
      setStatus(`${documentTypeLabel(document.document_type)} ${reviewStatus}.`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Could not save document review');
    } finally {
      setReviewingId(null);
    }
  };

  const filters: { value: DocumentReviewFilter; label: string }[] = [
    { value: 'submitted', label: 'Submitted' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: '', label: 'All' },
  ];

  const blocked = /admin only|unauthorized/i.test(status);

  return (
    <motion.div initial={{ opacity: 1, y: 0 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider gradient-text">Admin Review</p>
          <h2 className="font-outfit font-bold text-[1.5rem] gradient-text mt-1">Submitted Documents</h2>
          <p className="font-inter text-sm text-[#475569] mt-1">
            Open the Submitted filter, then Approve each contractor file.
          </p>
        </div>
        <div className="inline-flex flex-wrap gap-2 rounded-2xl border border-[#E2E8F0] bg-white p-1">
          {filters.map((item) => {
            const isActive = filter === item.value;
            return (
              <button
                key={item.label}
                onClick={() => setFilter(item.value)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={{
                  backgroundColor: isActive ? 'rgba(123,47,247,0.1)' : 'transparent',
                  color: isActive ? '#7B2FF7' : '#64748B',
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="glass-card p-6 min-h-[240px]">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-[#64748B]">
            <Loader2 size={16} className="animate-spin" />
            Loading submitted documents...
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-10">
            <ShieldCheck size={30} className="mx-auto text-[#94A3B8]" />
            <p className="mt-3 font-outfit font-bold gradient-text">No documents in this queue</p>
            <p className="text-sm text-[#64748B] mt-1">
              {blocked
                ? 'Sign out and sign in again as serhiykbusiness@gmail.com, then click Submitted.'
                : 'Click Submitted at the top right. Do not refresh the page.'}
            </p>
            <button
              type="button"
              onClick={() => setFilter('submitted')}
              className="mt-5 inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #7B2FF7 0%, #3B6BF7 100%)' }}
            >
              Show Submitted
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {documents.map((document) => {
              const owner = document.user;
              const ownerName = owner?.companyName || owner?.businessName || owner?.full_name || `User #${document.user_id}`;
              const isReviewing = reviewingId === document.id;
              const statusCopy = complianceStatusCopy[document.status] || { label: document.status, tone: '#7B2FF7' };
              return (
                <div key={document.id} className="rounded-2xl border border-[#E2E8F0] bg-white p-5 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-outfit font-bold gradient-text truncate">{ownerName}</h3>
                      <p className="text-xs text-[#64748B] truncate">{owner?.email || 'Email unavailable'}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider shrink-0" style={{ color: statusCopy.tone, backgroundColor: 'rgba(123,47,247,0.08)' }}>
                      {statusCopy.label}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-[#0F172A] break-words">{documentTypeLabel(document.document_type)}: {document.file_name}</p>
                  <p className="text-xs text-[#64748B]">Size: {formatFileSize(document.file_size)} | Submitted: {document.submitted_at ? formatDate(document.submitted_at) : 'Unknown'}</p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button onClick={() => reviewDocument(document, 'approved')} disabled={isReviewing || document.status === 'approved'} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #10B981 0%, #3B6BF7 100%)' }}>
                      {isReviewing ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                      Approve
                    </button>
                    <button onClick={() => reviewDocument(document, 'rejected')} disabled={isReviewing || document.status === 'rejected'} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#FCA5A5] px-4 py-2.5 text-sm font-semibold text-[#EF4444] disabled:opacity-50">
                      {isReviewing ? <Loader2 size={15} className="animate-spin" /> : <XCircle size={15} />}
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {status && <p className={`text-sm mt-4 ${blocked || status.includes('Could') ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>{status}</p>}
      </div>
    </motion.div>
  );
}
