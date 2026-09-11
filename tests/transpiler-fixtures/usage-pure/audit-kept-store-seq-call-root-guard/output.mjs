import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a kept store of a seq-prefixed PROVEN CALL nav guards like its ident twin: the store takes
// the guarded value, the prefix rides inside the test - spelled once, claims inside it live
// (the render defers to the host's exit so a prefix claim lands before the slice is cloned).
// an optional call link keeps its own `?.` in the test
let held;
const seqLog = [];
const utRoot = () => _globalThis;
export const storedSeqCallRoot = (held = null == (_pushMaybeArray(seqLog).call(seqLog, 1), utRoot()).window ? void 0 : _self)?.customQ;
export const storedSeqOptionalCallRoot = (held = null == (_pushMaybeArray(seqLog).call(seqLog, 2), utRoot?.()).window ? void 0 : _self)?.customQ;
export { held, seqLog };