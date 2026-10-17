// An emit that COLLAPSES a receiver replaces source it does not reproduce, so a polyfillable read buried in the discarded region
// has to stand down with it - left queued it composes against text that is gone and the build aborts.
function dh(x) { return globalThis; }
// a callee that IGNORES its parameter returns the same value for every argument, so the root IS
// proven and the static claims - the argument's own read rides the discarded span, exactly like the
// arrow spelling above. the genuinely opaque row is the one below, whose callee READS its parameter
export const paramIgnoringRoot = dh(Promise).self.Array.of(6);
