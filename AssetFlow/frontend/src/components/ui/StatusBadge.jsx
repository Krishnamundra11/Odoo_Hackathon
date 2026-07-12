const STYLES = {
  pending: 'bg-amber-50 text-amber-600 border-amber-200',
  approved: 'bg-blue-50 text-blue-600 border-blue-200',
  technician_assigned: 'bg-purple-50 text-purple-600 border-purple-200',
  in_progress: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  resolved: 'bg-green-50 text-green-600 border-green-200',
  rejected: 'bg-red-50 text-red-600 border-red-200',
  verified: 'bg-green-50 text-green-600 border-green-200',
  missing: 'bg-red-50 text-red-600 border-red-200',
  damaged: 'bg-amber-50 text-amber-600 border-amber-200',
  upcoming: 'bg-blue-50 text-blue-600 border-blue-200',
  ongoing: 'bg-green-50 text-green-600 border-green-200',
  completed: 'bg-gray-50 text-gray-500 border-gray-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
};

export default function StatusBadge({ status }) {
  const key = (status || '').toLowerCase().replace(/\s+/g, '_');
  const style = STYLES[key] || 'bg-gray-50 text-gray-500 border-gray-200';
  return (
    <span className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${style}`}>
      {(status || '').replace(/_/g, ' ')}
    </span>
  );
}

export function LoadingState() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-200" />
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <p className="font-medium text-red-700">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message }) {
  return <p className="py-10 text-center text-sm text-gray-400">{message}</p>;
}