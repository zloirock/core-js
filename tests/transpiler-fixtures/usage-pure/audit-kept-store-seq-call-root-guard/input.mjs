// A kept store of a sequence-prefixed proven call lands its plain proxy tail on self.
// Prefix claims remain live and execute once before the assignment.
// The optional-call twin has a known present callee and preserves the same value and effects.
let held;
const seqLog = [];
const utRoot = () => globalThis;
export const storedSeqCallRoot = (held = (seqLog.push(1), utRoot()).window.self)?.customQ;
export const storedSeqOptionalCallRoot = (held = (seqLog.push(2), utRoot?.()).window.self)?.customQ;
export { held, seqLog };
