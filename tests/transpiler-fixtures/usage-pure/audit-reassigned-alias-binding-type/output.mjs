import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// a binding whose ctor-alias write is followed by a USER reassignment: the alias hint is
// refused (last write wins), and the TYPE flow follows the reassignment instead - both
// emitters narrow the member to the reassigned value's variant. babel used to lose the
// binding from its scope registry after the alias rewrite and degraded to generic while
// the estree side narrowed - the recovery rebuilds the binding from the AST. a function
// scope redeclaring the name keeps its own shadow binding untouched
let M;
M = _Map;
M = [5, 6];
export const r1 = _atMaybeArray(M).call(M, 0);
let P;
P = _Promise;
P = 'ts';
export const r2 = _includesMaybeString(P).call(P, 't');
let Q;
Q = _Map;
Q = [[7], 8];
function inner() {
  const Q = 'str';
  return typeof _atMaybeString(Q);
}
export const r3 = [_flatMaybeArray(Q).call(Q).length, inner()];