import { useEffect, useState } from "react";

// Returns `[debounced, setNow]`. `debounced` follows `value` after `delay` ms of
// silence; `setNow(v)` publishes a value immediately (for programmatic changes
// such as picking an example, where waiting would only feel laggy).
export function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    if (value === debounced) return undefined;
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay, debounced]);

  return [debounced, setDebounced];
}
