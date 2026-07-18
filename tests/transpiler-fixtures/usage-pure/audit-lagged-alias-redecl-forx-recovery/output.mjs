import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _toSplicedMaybeArray from "@core-js/pure/actual/array/instance/to-spliced";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
import _globalThis from "@core-js/pure/actual/global-this";
import _includes from "@core-js/pure/actual/instance/includes";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// a LAGGED alias binding (babel drops it from its scope registry after the destructure-
// assignment rewrite) crossed with sibling redeclarations and a for-of head write. the
// rebuilt binding mirrors a native one: a redecl-with-init is an ordinary violation the
// redecl flow resolves to its value's variant, a bare redecl carries no value and keeps
// the alias narrow, and a for-of head write widens the member to the generic helper
var M;
M = _Map;
var M = [1, 2];
export const r1 = _atMaybeArray(M).call(M, 0);
export const r1b = _toSortedMaybeArray(M).call(M);
export const r1c = M == null ? void 0 : _toReversedMaybeArray(M).call(M);
var B;
B = _Map;
var B;
export const r2 = _Map$groupBy([1], x => x);
let F;
F = _Map;
for (F of [_globalThis.x]) {}
export const r3 = _flatMaybeArray(F).call(F);
// a `var` of the same name in a DEEPER nested function is not a shadow at the writing
// function's level: the write there still counts and widens the member to generic
let D;
D = _Map;
function outer() {
  function inner() {
    var D = 0;
    return D;
  }
  D = ['d'];
  return inner;
}
export const r4 = [_includes(D).call(D, 'd'), outer()];
// an EXPORTED lagged alias resolves through the export wrapper the same as a plain one
export let E;
E = _Map;
E = [9];
export const r5 = _toSplicedMaybeArray(E).call(E, 0, 1);
// an update write makes the value unknown - the member widens to the generic helper
var U;
U = _Map;
U++;
export const r6 = _flatMapMaybeArray(U).call(U, x => x);
// a case-consequent lexical is outside the recovery's block climb - conservative generic
switch (_globalThis.k) {
  case 1:
    let S;
    S = _Map;
    S = [4];
    _globalThis.r7 = _withMaybeArray(S).call(S, 0, 'w');
}
// the other lexical hosts the recovery climbs: a plain block and a class static block
{
  let K;
  K = _Map;
  K = [5];
  _globalThis.r8 = _findLastMaybeArray(K).call(K, Boolean);
}
class C {
  static {
    let T;
    T = _Map;
    T = [6];
    C.r9 = _findLastIndexMaybeArray(T).call(T, Boolean);
  }
}
export { C };