// a kept store of a seq-prefixed PROVEN CALL nav guards like its ident twin: the store takes
// the guarded value, the prefix rides inside the test - spelled once, claims inside it live
// (the render defers to the host's exit so a prefix claim lands before the slice is cloned).
// an optional call link keeps its own `?.` in the test
let held;
const seqLog = [];
const utRoot = () => globalThis;
export const storedSeqCallRoot = (held = (seqLog.push(1), utRoot()).window.self)?.customQ;
export const storedSeqOptionalCallRoot = (held = (seqLog.push(2), utRoot?.()).window.self)?.customQ;
export { held, seqLog };
