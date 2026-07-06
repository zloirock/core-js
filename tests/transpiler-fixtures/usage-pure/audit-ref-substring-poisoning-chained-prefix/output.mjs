import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _ref10;
// chained polyfills mint `_ref`, `_ref2`, ..., `_ref10` UIDs in one scope; `_ref10`
// contains `_ref` as a substring. whole-identifier matching against the original source
// slice must not hit `_ref` inside `_ref10` when counting the 10th. 3 distinct chained
// instance methods each emit a separate import, so any miscount is visible per-line.
const a = _at(_ref = _flatMaybeArray(arr).call(arr)).call(_ref, -1);
const b = _includes(_ref2 = _at(_ref3 = _flatMaybeArray(arr).call(arr)).call(_ref3, -1)).call(_ref2, 1);
const c = _includes(_ref4 = _at(_ref5 = _flatMaybeArray(arr).call(arr)).call(_ref5, -1)).call(_ref4, 2).toString();
const d = _includes(_ref6 = _at(_ref7 = _flatMaybeArray(arr).call(arr)).call(_ref7, -2)).call(_ref6, 3).toString();
const e = _includes(_ref8 = _at(_ref9 = _flatMaybeArray(arr).call(arr)).call(_ref9, -3)).call(_ref8, 4).toString();
const f = _at(_ref10 = _flatMaybeArray(arr).call(arr)).call(_ref10, -4);