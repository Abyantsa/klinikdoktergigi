import { useEffect, useRef, useState } from "react";

export function usePolling(fetchFn, intervalMs = 10000, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const savedFn = useRef(fetchFn);
  savedFn.current = fetchFn;

  useEffect(() => {
    let active = true;
    let timer;

    const run = async () => {
      try {
        const result = await savedFn.current();
        if (active) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (active) setError(err);
      } finally {
        if (active) setLoading(false);
      }
    };

    run();
    timer = setInterval(run, intervalMs);

    return () => {
      active = false;
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, ...deps]);

  return { data, loading, error };
}
