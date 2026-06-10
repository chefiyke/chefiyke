import { useCallback, useRef } from "react";

/**
 * Returns a throttled version of the callback that can only be called
 * once per `limit` milliseconds. Used for button click-throttling and
 * abuse prevention.
 */
export function useThrottle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit = 1000,
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  const lastCall = useRef<number>(0);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall.current >= limit) {
        lastCall.current = now;
        return fn(...args) as ReturnType<T>;
      }
      return undefined;
    },
    [fn, limit],
  );
}

/**
 * Returns a debounced version of the callback. The function will only
 * fire after `delay` milliseconds of inactivity.
 */
export function useDebounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay = 300,
): (...args: Parameters<T>) => void {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        fn(...args);
      }, delay);
    },
    [fn, delay],
  );
}
