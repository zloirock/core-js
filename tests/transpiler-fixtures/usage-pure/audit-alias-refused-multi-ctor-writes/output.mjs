import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// ONE binding written from TWO different destructured globals is dirty - its registration is
// refused; the value swaps still land in write order and the member read gets the RUNTIME ctor
// guard. the guard tests EVERY ctor the slot was written with, the last write's hint first: whichever
// one the binding actually holds answers with ITS pure static, and a value that is none of them keeps
// the raw read. keyed on the last write alone, a key that lives on an EARLIER write's ctor
// (`groupBy` is Map's, the last write is Promise) lost its polyfill and read `undefined` off the
// swapped binding
let M;
M = _Map;
M = _Promise;
export const r = typeof (M === _Promise ? _Promise$try : M.try);
export const q = typeof (M === _Map ? _Map$groupBy : M.groupBy);
// a key on NEITHER ctor keeps the raw read - no candidate resolves, so there is no guard to build
export const noCandidate = typeof M.noSuchStaticAnywhere;

// a write whose RHS resolves on its OWN (`W = globalThis.Map`) registers no alias, so the registry
// cannot name its ctor - the binding's write enumeration can, and it feeds the same candidate list
let W;
if (_globalThis) W = _Map;
if (!_globalThis) W = _Promise;
export const viaWriteEnumeration = typeof (W === _Map ? _Map$groupBy : W.groupBy);
export const viaWriteEnumerationDestructured = (() => {
  const g = W === _Map ? _Map$groupBy : W.groupBy;
  return typeof g;
})();
// BOTH candidates carry the key: the guard chains them, so whichever the binding holds answers
let B;
if (_globalThis) B = _Map;
if (!_globalThis) ({
  Object: B
} = _globalThis);
export const bothCarryTheKey = typeof (B === Object ? _Object$groupBy : B === _Map ? _Map$groupBy : B.groupBy);