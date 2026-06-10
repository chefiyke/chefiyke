/**
 * Production-safe logger.
 *
 * Development: all log levels pass through.
 * Production:  console.log/debug/info/trace/table/warn are silently suppressed.
 *              console.error is allowed only for sanitized critical messages.
 */

const isDev = import.meta.env.DEV === true;

const SAFE_ERROR_PREFIXES = [
  "Network request failed",
  "Authentication failed",
  "Critical system error",
];

const logger = {
  log: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },
  debug: (...args: unknown[]) => {
    if (isDev) console.debug(...args);
  },
  info: (...args: unknown[]) => {
    if (isDev) console.info(...args);
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args);
  },
  trace: (...args: unknown[]) => {
    if (isDev) console.trace(...args);
  },
  table: (...args: unknown[]) => {
    if (isDev) console.table(...args);
  },
  /**
   * Only these sanitized prefix messages are allowed in production.
   * Raw backend errors, stack traces, tokens, and internal state must never
   * reach the browser console in production.
   */
  error: (message: string) => {
    const isSafe = SAFE_ERROR_PREFIXES.some((prefix) =>
      message.startsWith(prefix),
    );
    if (isDev || isSafe) {
      console.error(message);
    }
  },
};

export default logger;
