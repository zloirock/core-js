// ONE binding written from TWO different destructured globals is dirty - its registration is
// refused; the value swaps still land in write order and the member read gets the RUNTIME ctor
// guard. the guard tests EVERY ctor the slot was written with, the last write's hint first: whichever
// one the binding actually holds answers with ITS pure static, and a value that is none of them keeps
// the raw read. keyed on the last write alone, a key that lives on an EARLIER write's ctor
// (`groupBy` is Map's, the last write is Promise) lost its polyfill and read `undefined` off the
// swapped binding
let M;
({ Map: M } = globalThis);
({ Promise: M } = globalThis);
export const r = typeof M.try;
export const q = typeof M.groupBy;
// a key on NEITHER ctor keeps the raw read - no candidate resolves, so there is no guard to build
export const noCandidate = typeof M.noSuchStaticAnywhere;

// a write whose RHS resolves on its OWN (`W = globalThis.Map`) registers no alias, so the registry
// cannot name its ctor - the binding's write enumeration can, and it feeds the same candidate list
let W;
if (globalThis) W = globalThis.Map;
if (!globalThis) ({ Promise: W } = globalThis);
export const viaWriteEnumeration = typeof W.groupBy;
export const viaWriteEnumerationDestructured = (() => { const { groupBy: g } = W; return typeof g; })();
// BOTH candidates carry the key: the guard chains them, so whichever the binding holds answers
let B;
if (globalThis) ({ Map: B } = globalThis);
if (!globalThis) ({ Object: B } = globalThis);
export const bothCarryTheKey = typeof B.groupBy;
