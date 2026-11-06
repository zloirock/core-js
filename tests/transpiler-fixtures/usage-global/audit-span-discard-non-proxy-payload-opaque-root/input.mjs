// An emit that COLLAPSES a receiver replaces source it does not reproduce, so a polyfillable read buried in the discarded region
// has to stand down with it - left queued it composes against text that is gone and the build aborts.
function dh(x) { return globalThis; }
// negative: an OPAQUE call root proves nothing about its return value, so the static is not claimed
// and the navigation stays exactly as written - only the argument, which survives, is rewritten
export const opaqueRoot = dh(Promise).self.Array.of(6);
