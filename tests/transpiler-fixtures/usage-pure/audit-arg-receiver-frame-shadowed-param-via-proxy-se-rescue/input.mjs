// ... and the RESCUE the drain re-emits is a CLONE of that receiver: a clone inherits no frame of
// its own, so the proxy-root substitution asked about the copy in the pattern's frame, saw the
// parameter binding and left a RAW `globalThis` read - the one spelling the pure flavour may never
// emit (an engine without it answers a ReferenceError, which is what the ponyfill import prevents)
let hits = 0;
const viaProxySeRescue = (function ({ from } = Object, globalThis) {
  return from;
})((hits++, globalThis).Array);
export { hits };
export { viaProxySeRescue };
