// a MIXED parameter destructure `{ Math: { floor }, Set } = globalThis`: the nested non-polyfillable
// subtree (`Math.floor`) passes through, but the flat MISSING-ABLE ctor `Set` must still be mirrored to
// the pure constructor (`Set: _Set`) - the structural deferral gate previously stranded it on a raw
// `_globalThis.Set` read that throws off-engine. an injecting ctor passthrough keeps the mirror alive for
// the whole pattern even though the only nested value is non-polyfillable
function read({ Math: { floor }, Set } = globalThis) {
  return [floor(1.9), new Set()];
}
export const out = read();
