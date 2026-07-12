import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/StatusBadge';
import * as allocationsApi from '../../features/allocations/api/allocationsApi';

export default function AllocationScreen() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const assetId = searchParams.get('assetId');

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [allocation, setAllocation] = useState(null);
  const [history, setHistory] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [toEmployee, setToEmployee] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(!!assetId);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!assetId) return;
    setLoading(true);
    setError('');
    Promise.all([
      allocationsApi.getAssetAllocation(assetId),
      allocationsApi.getAllocationHistory(assetId),
      allocationsApi.getEmployees(),
    ])
      .then(([allocRes, historyRes, empRes]) => {
        setAllocation(allocRes.data);
        setHistory(historyRes.data || []);
        setEmployees(empRes.data || []);
      })
      .catch((err) => setError(err.message || 'Could not load allocation details for this asset.'))
      .finally(() => setLoading(false));
  }, [assetId]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    try {
      const res = await allocationsApi.searchAssets(query);
      setResults(res.data || []);
    } catch (err) {
      setError(err.message || 'Search failed.');
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    if (!toEmployee) {
      setFormError('Please select an employee to transfer to.');
      return;
    }
    setSubmitting(true);
    try {
      await allocationsApi.requestTransfer(assetId, { toEmployeeId: toEmployee, reason });
      setFormSuccess('Transfer request submitted for approval.');
      setReason('');
      setToEmployee('');
    } catch (err) {
      setFormError(err.message || 'Could not submit the transfer request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!assetId) {
    return (
      <div className="space-y-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
        <h1 className="text-xl font-bold text-[#061E29]">Allocation & Transfer</h1>
        <form onSubmit={handleSearch} className="flex max-w-md gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by asset tag or name..."
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-[#1D546D] focus:outline-none"
            />
          </div>
          <button type="submit" className="rounded-lg bg-[#1D546D] px-4 py-2 text-sm font-medium text-white hover:bg-[#061E29]">
            Search
          </button>
        </form>
        {error && <ErrorState message={error} />}
        <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
          {results.length === 0 ? (
            <EmptyState message="Search for an asset to view or manage its allocation." />
          ) : (
            results.map((a) => (
              <button
                key={a.id}
                onClick={() => setSearchParams({ assetId: a.id })}
                className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
              >
                <span className="font-medium text-[#061E29]">{a.tag} — {a.name}</span>
                <span className="text-sm text-gray-400">{a.status}</span>
              </button>
            ))
          )}
        </div>
      </div>
    );
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={() => setSearchParams({ assetId })} />;

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => (assetId ? setSearchParams({}) : navigate(-1))}
        className="text-sm font-medium text-[#1D546D] hover:underline"
      >
        Back
      </button>

      <h1 className="text-xl font-bold text-[#061E29]">
        {allocation?.assetTag} — {allocation?.assetName}
      </h1>

      {allocation?.currentHolder && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Already Allocated to {allocation.currentHolder.name} ({allocation.currentHolder.department})
          <br />
          Direct re-allocation is blocked — submit a transfer request below.
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h2 className="mb-3 font-semibold text-[#061E29]">Transfer Request</h2>
        {formError && <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</div>}
        {formSuccess && <div className="mb-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{formSuccess}</div>}
        <form onSubmit={handleTransfer} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#061E29]">From</label>
              <input disabled value={allocation?.currentHolder?.name || '—'}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#061E29]">To</label>
              <select value={toEmployee} onChange={(e) => setToEmployee(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1D546D] focus:outline-none">
                <option value="">Select Employee...</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#061E29]">Reason</label>
            <textarea
              maxLength={300}
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide reason for transfer..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1D546D] focus:outline-none"
            />
            <p className="mt-1 text-right text-xs text-gray-400">{reason.length}/300</p>
          </div>
          <button type="submit" disabled={submitting}
            className="rounded-lg bg-[#1D546D] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#061E29] disabled:opacity-50">
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h2 className="mb-3 font-semibold text-[#061E29]">Allocation History</h2>
        {history.length === 0 ? (
          <EmptyState message="No allocation history for this asset yet." />
        ) : (
          <ul className="space-y-2 text-sm text-[#061E29]">
            {history.map((h) => (
              <li key={h.id}>
                {new Date(h.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} — {h.description}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}