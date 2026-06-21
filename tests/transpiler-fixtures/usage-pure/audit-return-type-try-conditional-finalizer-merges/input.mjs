// try / finally with a CONDITIONAL finalizer return: per spec the finalizer overrides
// try's return ONLY when it terminates unconditionally. `finally { if (cond) return null }`
// may fall through, so `return [1,2,3]` stays observable; gating the override on
// always-exits keeps Array<number> from being dropped (else `.at()` degrades to generic).
// the null is skipped from the fold but kept as a fallback deferring to the concrete Array.
declare const cond: boolean;
function probe() {
  try {
    return [1, 2, 3];
  } finally {
    if (cond) return null;
  }
}
probe().at(-1);
