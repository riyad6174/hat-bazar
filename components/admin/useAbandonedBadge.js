import { useCallback, useEffect, useRef, useState } from 'react';

const ENDPOINT = '/api/admin/abandoned-orders/notifications';
const SEEN_EVENT = 'abandoned-orders-seen';
const POLL_INTERVAL_MS = 60 * 1000;

/** Clears the "new abandoned orders" counter. Abandoned records are untouched. */
export async function markAbandonedSeen() {
  try {
    const response = await fetch(ENDPOINT, { method: 'POST' });
    if (response.ok) window.dispatchEvent(new Event(SEEN_EVENT));
  } catch {}
}

export function useAbandonedBadge({ waitForSeen = false } = {}) {
  const [count, setCount] = useState(0);
  const generation = useRef(0);

  const refresh = useCallback(async () => {
    const startedIn = generation.current;
    try {
      const response = await fetch(ENDPOINT);
      if (!response.ok) return;
      const { newCount } = await response.json();
      // A request started before the counter was cleared has a stale answer.
      if (startedIn === generation.current) setCount(newCount);
    } catch {}
  }, []);

  useEffect(() => {
    if (!waitForSeen) refresh();

    const handleSeen = () => {
      generation.current += 1;
      setCount(0);
      refresh();
    };
    const interval = setInterval(() => {
      if (!document.hidden) refresh();
    }, POLL_INTERVAL_MS);

    window.addEventListener(SEEN_EVENT, handleSeen);
    return () => {
      clearInterval(interval);
      window.removeEventListener(SEEN_EVENT, handleSeen);
    };
  }, [refresh, waitForSeen]);

  return count;
}
