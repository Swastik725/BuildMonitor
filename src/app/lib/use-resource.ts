import { useCallback, useEffect, useState } from "react";

export function useResource<T>(loader: () => Promise<T>, deps: unknown[] = [], pollMs?: number) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    setLoading(true);
    try { setData(await loader()); setError(null); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to load data"); }
    finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => { void refresh(); if (!pollMs) return; const id = window.setInterval(() => void refresh(), pollMs); return () => window.clearInterval(id); }, [refresh, pollMs]);
  return { data, loading, error, refresh };
}
