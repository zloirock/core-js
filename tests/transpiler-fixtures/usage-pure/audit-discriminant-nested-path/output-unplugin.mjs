import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _toSplicedMaybeArray from "@core-js/pure/actual/array/instance/to-spliced";
// the discriminant field may sit behind nested hops; the guard walks the field path
type U = { m: { k: 'a' }, xs: number[] } | { m: { k: 'b' }, xs: string };
function gn(u: U) { if (u.m.k === 'a') { var _ref; _atMaybeArray(_ref = u.xs).call(_ref, 0); } }
// switch over a nested discriminant narrows its cases
function gs(u: U) {
var _ref2; switch (u.m.k) { case 'a': _toReversedMaybeArray(_ref2 = u.xs).call(_ref2); } }
// an optional-chained test still narrows the positive branch
function go(u: U) { if (u?.m?.k === 'a') { var _ref3; _toSplicedMaybeArray(_ref3 = u.xs).call(_ref3, 0, 1); } }
// deeper chains walk hop by hop
type D = { a: { b: { c: 'x' } }, xs: number[] } | { a: { b: { c: 'y' } }, xs: string };
function gd(u: D) { if (u.a.b.c === 'x') { var _ref4; _flatMaybeArray(_ref4 = u.xs).call(_ref4); } }