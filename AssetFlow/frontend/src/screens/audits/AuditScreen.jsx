import { useEffect, useState } from 'react';
import StatusBadge from '../../components/ui/StatusBadge';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/StatusBadge';
import * as auditsApi from '../../features/audits/api/auditsApi';
import { useAuth } from '../../features/auth/hooks/useAuth';

const RESULT_COLORS = {
  pending: 'bg-gray-100 text-gray-500',
  verified: 'bg-emerald-100 text-emerald-700',
  missing: 'bg-red-100 text-red-700',
  damaged: 'bg-orange-100 text-orange-700',
};

export default function AuditScreen() {
  const { user } = useAuth();
  const [audit, setAudit] = useState(null);
  const [discrepancyReport, setDiscrepancyReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [closing, setClosing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const load = () => {
    setLoading(true);
    setError('');
    auditsApi
      .getActiveAuditCycle()
      .then(async (cycle) => {
        setAudit(cycle);
        if (cycle && cycle.status === 'closed') {
          try {
            const report = await auditsApi.getDiscrepancyReport(cycle.id);
            setDiscrepancyReport(report);
          } catch (e) {
            console.error('Failed to load discrepancy report', e);
          }
        }
      })
      .catch((err) => setError(err.message || 'Could not load the active audit cycle.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleVerify = async (assetId, result) => {
    try {
      await auditsApi.markAuditItem(audit.id, assetId, result);
      // Optimistic update
      setAudit((prev) => ({
        ...prev,
        items: prev.items.map((i) => (i.assetId === assetId ? { ...i, result } : i)),
      }));
    } catch (err) {
      setError(err.message || 'Could not update verification status.');
      load(); // Reload on error to sync state
    }
  };

  const handleClose = async () => {
    setClosing(true);
    try {
      await auditsApi.closeAuditCycle(audit.id);
      setShowConfirm(false);
      load();
    } catch (err) {
      setError(err.message || 'Could not close the audit cycle.');
    } finally {
      setClosing(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!audit) return <EmptyState message="No active audit cycle. Create one from the Audit module to get started." />;

  const isAssetManager = user?.role === 'asset_manager';
  const isAssignedAuditor = audit.auditors.includes(user?.name);
  const canVerify = audit.status !== 'closed' && (isAssignedAuditor || isAssetManager);

  const flaggedCount = (audit.items || []).filter((i) => i.result === 'missing' || i.result === 'damaged').length;

  return (
    <div className="space-y-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#061E29]">Asset Audit</h1>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${audit.status === 'closed' ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-700'}`}>
          {audit.status.replace('_', ' ')}
        </span>
      </div>

      <div className="rounded-xl border border-gray-200 bg-[#F3F4F4] px-5 py-4 text-sm text-[#061E29]">
        <div className="flex justify-between items-start mb-2">
          <p className="font-semibold text-base">{audit.name}</p>
          <p className="text-gray-500">{audit.dateRange}</p>
        </div>
        <p className="text-gray-600 mb-1"><span className="font-medium">Scope:</span> {audit.scope}</p>
        <p className="text-gray-600"><span className="font-medium">Auditors:</span> {audit.auditors?.join(', ') || 'None assigned'}</p>
      </div>

      {audit.status === 'closed' && discrepancyReport && discrepancyReport.discrepancies?.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-amber-800 font-semibold mb-3">Discrepancy Report Generated</h2>
          <ul className="space-y-2 text-sm text-amber-700">
            {discrepancyReport.discrepancies.map(d => (
              <li key={d.id} className="flex gap-2">
                <span className="font-medium">{d.asset_tag}</span> — {d.asset_name}: <span className="uppercase font-semibold text-xs ml-1">{d.issue_type}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {audit.status !== 'closed' && flaggedCount > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {flaggedCount} asset{flaggedCount > 1 ? 's' : ''} flagged — closing this audit will automatically generate a discrepancy report.
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-5 py-4">Asset</th>
                <th className="px-5 py-4">Current Status</th>
                <th className="px-5 py-4">Expected Location</th>
                <th className="px-5 py-4">Verification Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(audit.items || []).map((item) => (
                <tr key={item.assetId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-[#061E29]">{item.assetTag}</p>
                    <p className="text-xs text-gray-500">{item.assetName}</p>
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={item.assetStatus} /></td>
                  <td className="px-5 py-4 text-gray-500">{item.expectedLocation}</td>
                  <td className="px-5 py-4">
                    {!canVerify ? (
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${RESULT_COLORS[item.result]}`}>
                        {item.result}
                      </span>
                    ) : (
                      <select
                        value={item.result || 'pending'}
                        onChange={(e) => handleVerify(item.assetId, e.target.value)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1D546D]/20 ${
                          item.result === 'pending' ? 'border-gray-300 text-gray-600' :
                          item.result === 'verified' ? 'border-emerald-300 bg-emerald-50 text-emerald-700' :
                          item.result === 'missing' ? 'border-red-300 bg-red-50 text-red-700' :
                          'border-orange-300 bg-orange-50 text-orange-700'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="missing">Missing</option>
                        <option value="damaged">Damaged</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))}
              {audit.items?.length === 0 && (
                <tr><td colSpan="4" className="text-center py-8 text-gray-500">No assets in this audit cycle.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {audit.status !== 'closed' && isAssetManager && (
        <div className="flex justify-end pt-4">
          <button
            onClick={() => setShowConfirm(true)}
            className="rounded-xl bg-[#061E29] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#1D546D] hover:shadow-md active:scale-95"
          >
            Close Audit Cycle
          </button>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-xl">
            <h3 className="mb-2 text-xl font-bold text-[#061E29]">Close Audit Cycle</h3>
            <p className="mb-6 text-sm text-gray-500 leading-relaxed">
              This will permanently lock the cycle. Any assets marked as <span className="font-semibold text-red-600">Missing</span> will automatically be transitioned to the "Lost" status, and a discrepancy report will be generated. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleClose}
                disabled={closing}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50"
              >
                {closing ? 'Closing...' : 'Yes, Close Cycle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}