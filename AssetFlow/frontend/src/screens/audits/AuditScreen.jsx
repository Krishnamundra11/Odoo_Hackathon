import { useEffect, useState } from 'react';
import StatusBadge from '../../components/ui/StatusBadge';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/StatusBadge';
import * as auditsApi from '../../features/audits/api/auditsApi';

export default function AuditScreen() {
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [closing, setClosing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const load = () => {
    setLoading(true);
    setError('');
    auditsApi
      .getActiveAuditCycle()
      .then((res) => setAudit(res.data))
      .catch((err) => setError(err.message || 'Could not load the active audit cycle.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleVerify = async (assetId, verification) => {
    try {
      await auditsApi.verifyAuditItem(audit.id, assetId, verification);
      load();
    } catch (err) {
      setError(err.message || 'Could not update verification status.');
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

  const flaggedCount = (audit.items || []).filter((i) => i.verification === 'missing' || i.verification === 'damaged').length;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-[#061E29]">Asset Audit</h1>

      <div className="rounded-lg border border-gray-200 bg-[#F3F4F4] px-4 py-3 text-sm text-[#061E29]">
        <p className="font-medium">{audit.name}: {audit.scope} — {audit.dateRange}</p>
        <p className="text-gray-500">Auditors: {audit.auditors?.join(', ')}</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-400">
            <tr>
              <th className="px-4 py-3">Asset</th>
              <th className="px-4 py-3">Expected Location</th>
              <th className="px-4 py-3">Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(audit.items || []).map((item) => (
              <tr key={item.assetId}>
                <td className="px-4 py-3 font-medium text-[#061E29]">{item.assetTag} {item.assetName}</td>
                <td className="px-4 py-3 text-gray-500">{item.expectedLocation}</td>
                <td className="px-4 py-3">
                  {audit.status === 'closed' ? (
                    <StatusBadge status={item.verification} />
                  ) : (
                    <select
                      value={item.verification || ''}
                      onChange={(e) => handleVerify(item.assetId, e.target.value)}
                      className="rounded-lg border border-gray-300 px-2 py-1 text-xs focus:border-[#1D546D] focus:outline-none"
                    >
                      <option value="">Pending</option>
                      <option value="verified">Verified</option>
                      <option value="missing">Missing</option>
                      <option value="damaged">Damaged</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {flaggedCount > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {flaggedCount} asset{flaggedCount > 1 ? 's' : ''} flagged — discrepancy report generated automatically
        </div>
      )}

      {audit.status !== 'closed' && (
        <button
          onClick={() => setShowConfirm(true)}
          className="rounded-lg bg-[#1D546D] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#061E29]"
        >
          Close Audit Cycle
        </button>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6">
            <h3 className="mb-2 font-semibold text-[#061E29]">Close this audit cycle?</h3>
            <p className="mb-4 text-sm text-gray-500">
              This locks the cycle and updates statuses for confirmed-missing items to "Lost." This can't be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowConfirm(false)} className="rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-100">
                Cancel
              </button>
              <button onClick={handleClose} disabled={closing} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
                {closing ? 'Closing...' : 'Close Cycle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}