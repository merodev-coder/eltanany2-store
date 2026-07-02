// frontend/src/hooks/useQuery.ts
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

type QueryFn<T> = (signal?: AbortSignal) => Promise<T>;

interface UseQueryOpts {
  queryKey: unknown[];
  queryFn: QueryFn<unknown>;
  enabled?: boolean;
  staleTimeMs?: number;
}

interface UseQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useQuery<T>({
  queryKey,
  queryFn,
  enabled = true,
  staleTimeMs,
}: UseQueryOpts): UseQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generationRef = useRef(0);
  const staleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keyStr = JSON.stringify(queryKey);

  const fetch = useCallback(() => {
    if (!enabled) return;

    const runId = ++generationRef.current;

    // Cancel any pending stale-time timeout.
    if (staleTimerRef.current) clearTimeout(staleTimerRef.current);

    const ac = new AbortController();
    setIsLoading(true);
    setError(null);

    queryFn(ac.signal)
      .then((result) => {
        if (runId !== generationRef.current) return;
        setData(result as T);

        // Mark data as fresh for `staleTimeMs`.
        if (staleTimeMs && staleTimeMs > 0) {
          staleTimerRef.current = setTimeout(() => {
            if (runId === generationRef.current) {
              // In a real cache invalidation pipeline you'd mark this key
              // stale.  Here we just leave the data in-place — consumers
              // decide when to refetch.
            }
          }, staleTimeMs);
        }
      })
      .catch((err) => {
        if (runId !== generationRef.current) return;
        if (err.name !== "AbortError") setError(err);
      })
      .finally(() => {
        if (runId === generationRef.current) setIsLoading(false);
      });

    return () => ac.abort();
  }, [enabled, keyStr, queryFn]);

  useEffect(() => {
    fetch();
    return () => {
      if (staleTimerRef.current) clearTimeout(staleTimerRef.current);
    };
  }, [fetch]);

  return { data, isLoading, error, refetch: fetch };
}
