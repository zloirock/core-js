import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref, _ref2;
// one early-exit condition carrying discriminant clauses for TWO different roots: each
// clause narrows its own binding after the exit - the string member binds the string
// variant, the array member the array variant
type U = {
  kind: 'a';
  v: string;
} | {
  kind: 'b';
  v: string[];
};
type W = {
  tag: 'x';
  w: number[];
} | {
  tag: 'y';
  w: string;
};
declare const u: U;
declare const w: W;
if (u.kind !== 'a' || w.tag !== 'x') throw new Error('shape');
export const r1 = _atMaybeString(_ref = u.v).call(_ref, 0);
export const r2 = _includesMaybeArray(_ref2 = w.w).call(_ref2, 3);