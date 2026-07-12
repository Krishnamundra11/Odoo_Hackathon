import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, ResponsiveContainer } from 'recharts';
import { LoadingState, ErrorState } from '../../components/ui/StatusBadge';
import * as reportsApi from '../../features/reports/api/reportsApi';

export default function ReportsScreen() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  const load = () => {
    setLoading(true);
    setError('');
    reportsApi
      .getReportsSummary()
      .then((res) => setData(res))
      .catch((err) => setError(err.message || 'Could not load report data.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await reportsApi.exportReport();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'assetflow-report.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || 'Could not export the report.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-[#061E29]">Reports & Analytics</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="mb-2 text-sm font-semibold text-[#061E29]">Utilization by Department</h2>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={data.utilizationByDepartment}>
              <XAxis dataKey="department" tick={{ fontSize: 10 }} stroke="#5F9598" />
              <Bar dataKey="value" fill="#5F9598" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="mb-2 text-sm font-semibold text-[#061E29]">Maintenance Frequency</h2>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={data.maintenanceFrequency}>
              <XAxis dataKey="period" tick={{ fontSize: 10 }} stroke="#5F9598" />
              <Line type="monotone" dataKey="value" stroke="#1D546D" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="mb-2 text-sm font-semibold text-[#061E29]">Most Used Assets</h2>
          <ul className="space-y-1 text-sm text-[#061E29]">
            {data.mostUsedAssets?.map((a) => (
              <li key={a.assetTag}>{a.assetTag} — {a.name}: {a.usageCount}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="mb-2 text-sm font-semibold text-[#061E29]">Idle Assets</h2>
          <ul className="space-y-1 text-sm text-[#061E29]">
            {data.idleAssets?.map((a) => (
              <li key={a.assetTag}>{a.assetTag} — {a.name}: unused {a.idleDays} days</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold text-[#061E29]">Assets due for maintenance / nearing retirement</h2>
        <ul className="space-y-1 text-sm text-[#061E29]">
          {data.upcomingMaintenance?.map((a) => (
            <li key={a.assetTag}>{a.assetTag} — {a.note}</li>
          ))}
        </ul>
      </div>

      <button
        onClick={handleExport}
        disabled={exporting}
        className="rounded-lg border border-[#1D546D] px-5 py-2.5 text-sm font-medium text-[#1D546D] hover:bg-[#1D546D] hover:text-white disabled:opacity-50"
      >
        {exporting ? 'Exporting...' : 'Export Report'}
      </button>
    </div>
  );
}