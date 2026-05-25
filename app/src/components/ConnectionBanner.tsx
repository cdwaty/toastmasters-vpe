import { useConnectionStatus } from '../lib/connectionMonitor';

export function ConnectionBanner() {
  const { online, reachable } = useConnectionStatus();
  if (online && reachable) return null;

  const message = !online
    ? 'You are offline. Changes will not be saved until your connection returns.'
    : 'Cannot reach the server. Retrying in the background…';

  return (
    <div
      role="status"
      className="bg-danger text-white px-5 py-2 text-sm text-center font-medium"
    >
      {message}
    </div>
  );
}
