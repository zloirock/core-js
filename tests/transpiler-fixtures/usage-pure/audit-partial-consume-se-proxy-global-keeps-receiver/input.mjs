// PARTIAL consume off an SE proxy-global receiver: one binding is a polyfillable global (extracted)
// and one is not (`parseInt` exists natively), so the receiver is NOT fully consumed - the dropped-
// receiver skip must NOT fire. the `globalThis` root stays, polyfilled to `_globalThis`, carrying the
// residual `{ parseInt }`. discriminating negative against the full-consume case which drops the root.
function eff() {}
const { Map, parseInt } = (eff(), globalThis);
export const m = new Map();
export const n = parseInt("1");
