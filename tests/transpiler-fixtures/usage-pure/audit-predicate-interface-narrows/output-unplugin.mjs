import _copyWithinMaybeArray from "@core-js/pure/actual/array/instance/copy-within";
import _entriesMaybeArray from "@core-js/pure/actual/array/instance/entries";
import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
// a user predicate narrowing to a STRUCTURAL target feeds member-chain resolution
interface F { ys: number[] }
function isF(o: unknown): o is F { return true; }
function gp(v: unknown) { if (isF(v)) { var _ref; _findLastIndexMaybeArray(_ref = v.ys).call(_ref, x => !!x); } }
// a method member of the target resolves its call return
interface M { make(): string }
function isM(o: unknown): o is M { return true; }
function gm(v: unknown) { if (isM(v)) { var _ref2; _padStartMaybeString(_ref2 = v.make()).call(_ref2, 2); } }
// inherited interface members resolve through the extends chain
interface SubI extends F { tag: string }
function isSub(o: unknown): o is SubI { return true; }
function gi(v: unknown) { if (isSub(v)) { var _ref3; _toSortedMaybeArray(_ref3 = v.ys).call(_ref3); } }
// composes with an && chain
function ga(v: unknown) { if (isSub(v) && v.tag) { var _ref4; _withMaybeArray(_ref4 = v.ys).call(_ref4, 0, 2); } }
// a UNION target composes with a discriminant guard on the result
type W = { kind: 'a', xs: number[] } | { kind: 'b', xs: string };
function isW(o: unknown): o is W { return true; }
function gw(v: unknown) { if (isW(v) && v.kind === 'a') { var _ref5; _fillMaybeArray(_ref5 = v.xs).call(_ref5, 0); } }
// a generic target substitutes its type arguments
interface Box<T> { val: T }
function isBox(o: unknown): o is Box<number[]> { return true; }
function gx(v: unknown) { if (isBox(v)) { var _ref6; _copyWithinMaybeArray(_ref6 = v.val).call(_ref6, 0, 1); } }
// the ternary nullable fold composes with a predicate-narrowed receiver
function gt(v: unknown, c: boolean) { if (isBox(v)) { var _ref7; _entriesMaybeArray(_ref7 = c ? v.val : null).call(_ref7); } }