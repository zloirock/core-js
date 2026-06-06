// two consecutive removed props (`from`, `of`) where the higher-indexed is LAST, alongside a
// non-removed string-key sibling (`"z": z`) that bails synth-swap so body-extract still removes
// from/of. the per-prop removal ranges must not overlap on the shared comma (else the transform
// queue throws "partial overlap"). regression lock for that crash
function f({ "z": z, from, of } = Array) { return [from, of, z]; }
f();
