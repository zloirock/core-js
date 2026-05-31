// two consecutive removed props (`from`, `of`) where the higher-indexed is LAST, alongside a
// non-removed computed-key sibling. the per-prop removal ranges must not overlap on the shared
// comma (else the transform queue throws "partial overlap"). regression lock for that crash
const k = "z";
function f({ [k]: z, from, of } = Array) { return [from, of, z]; }
f();
