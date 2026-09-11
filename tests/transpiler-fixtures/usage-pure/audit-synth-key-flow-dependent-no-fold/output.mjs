import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// per-branch synth-swap resolves a computed key to probe the proxy branch for a polyfillable static. a
// flow-dependent key (a conditional `var` declarator init) holds the literal only on the guarded path, so
// folding it would synth `[K]: _polyfill` and mask the native value on the skipped path - the resolver must
// see the real usage position and bail (no import). an UNCONDITIONAL dominating key still folds and synths
// its static. distinct statics per line so the present/absent imports are attributable.
function flowDependent({
  [K]: m
} = cond ? Array : {
  from() {
    return 1;
  }
}) {
  return m;
}
if (decorrelated) var K = 'from';
var J = 'fromEntries';
function unconditional({
  [J]: n
} = cond ? {
  [J]: _Object$fromEntries
} : {
  fromEntries() {
    return 2;
  }
}) {
  return n;
}
export const r = [flowDependent, unconditional];