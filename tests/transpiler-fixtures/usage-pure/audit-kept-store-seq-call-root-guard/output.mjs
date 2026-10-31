import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// A kept store of a sequence-prefixed proven call lands its plain proxy tail on self.
// Prefix claims remain live and execute once before the assignment.
// The optional-call twin has a known present callee and preserves the same value and effects.
let held;
const seqLog = [];
const utRoot = () => _globalThis;
export const storedSeqCallRoot = (held = (_pushMaybeArray(seqLog).call(seqLog, 1), _self))?.customQ;
export const storedSeqOptionalCallRoot = (held = (_pushMaybeArray(seqLog).call(seqLog, 2), _self))?.customQ;
export { held, seqLog };