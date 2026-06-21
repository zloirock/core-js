// two consecutive removed props (`from`, `of`) where the higher-indexed is LAST, alongside a
// retained string-key sibling (`"z": z`). the two per-prop removal ranges must not overlap on
// the shared comma (else "partial overlap" crash). IIFE form: a caller-lossy param emission is
// sound only when every call site is visible (a declared fn's params now stay verbatim instead)
(function f({ "z": z, from, of } = Array) { return [from, of, z]; })();
