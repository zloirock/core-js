// an UNCLAIMED object-pattern destructure (no polyfillable prop) has no owner in the
// destructure pipeline, so its proxy-hop receiver collapses in place exactly like a
// non-destructure receiver - deferring would strand a raw `_globalThis['self']...`
// (undefined off-engine)
const { qq1 } = globalThis['self'].Array.prototype;
export const r1 = typeof qq1;
