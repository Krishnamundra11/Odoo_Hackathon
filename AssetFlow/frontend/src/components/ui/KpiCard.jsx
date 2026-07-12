import { ArrowUp, ArrowDown } from 'lucide-react';

export default function KpiCard({ icon: Icon, label, value, trend, trendDirection = 'up', danger = false }) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        danger ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'
      }`}
    >
      <div className="mb-3 flex items-center gap-2">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${danger ? 'bg-red-100' : 'bg-[#F3F4F4]'}`}>
          <Icon className={`h-4 w-4 ${danger ? 'text-red-500' : 'text-[#1D546D]'}`} />
        </div>
        <span className={`text-sm ${danger ? 'text-red-700' : 'text-gray-500'}`}>{label}</span>
      </div>
      <p className={`text-2xl font-semibold ${danger ? 'text-red-700' : 'text-[#061E29]'}`}>{value}</p>
      {trend && !danger && (
        <div className="mt-2 flex items-center gap-1 text-xs">
          {trendDirection === 'up' ? (
            <ArrowUp className="h-3 w-3 text-green-600" />
          ) : (
            <ArrowDown className="h-3 w-3 text-red-500" />
          )}
          <span className={trendDirection === 'up' ? 'text-green-600' : 'text-red-500'}>{trend}</span>
        </div>
      )}
      {danger && <p className="mt-2 text-xs font-medium text-red-600">Needs immediate action</p>}
      <div className={`mt-3 h-1 w-full rounded-full ${danger ? 'bg-red-200' : 'bg-[#F3F4F4]'}`}>
        <div className={`h-1 rounded-full ${danger ? 'bg-red-400' : 'bg-[#5F9598]'} w-2/3`} />
      </div>
    </div>
  );
}