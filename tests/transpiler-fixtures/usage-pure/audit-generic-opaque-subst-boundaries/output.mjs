import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
// substitution boundaries around opaque markers: a resolvable sibling keeps precision next
// to a marked one; a PARTIAL explicit list marks only the supplied slot; a default-only
// call still binds its defaults; per-call maps stay isolated; a cyclic function-level
// default with a supplied opaque arg degrades without looping; an indexed-access peek
// falls through untouched
type Opaque = {
  z: 1;
};
declare const opaque: Opaque;
function mix<T, U = number[]>(t: T | null, u: U): U {
  return u;
}
_atMaybeArray(_ref = mix(opaque, [1])).call(_ref, 0);
function partial<T = number[], U = T>(): U {
  return [] as any;
}
_includes(_ref2 = partial<Opaque>()).call(_ref2, 1);
function defaultsOnly<U = string[]>(): U {
  return [] as any;
}
_atMaybeArray(_ref3 = defaultsOnly()).call(_ref3, 0);
function twice<T = string>(x: T | null): T {
  return x as any;
}
_at(_ref4 = twice(opaque)).call(_ref4, 0);
_includes(_ref5 = twice('abc')).call(_ref5, 'b');
function cyc<T = T[]>(x: T | null): T {
  return x as any;
}
_at(_ref6 = cyc(opaque)).call(_ref6, 0);
declare const tup: [string, number];
function head<T extends unknown[]>(t: T): T[0] {
  return t[0];
}
_includes(_ref7 = head(tup)).call(_ref7, 'q');