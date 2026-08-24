import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Array$of from "@core-js/pure/actual/array/of";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
// three shapes the differential's AST leg caught while the fixture gate stayed green - each one a
// claim the AST engine used to DROP or fold wrong, and none of them a text difference:
// an optional dispatch over an SE-bearing sequence receiver, a nested instance leaf in a bodyless
// slot, and a `delete` whose target must stay a member read
const arr = [3, [1, 2]];
// a receiver the guard cannot spell twice memoizes INTO the test; the receiver's own prefix runs
// there, once, and only the KEY's effects stay in the alternate
export const a1 = null == (_ref = (eff(), arr)) ? void 0 : _flatMaybeArray(_ref).call(_ref);
export const a2 = null == (_ref2 = (eff(), arr)) ? void 0 : _atMaybeArray(_ref2).call(_ref2, 1);
export const a3 = null == (_ref3 = (eff(), arr)) ? void 0 : (eff2(), _flatMaybeArray(_ref3).call(_ref3));
export const a4 = null == (_ref4 = null == (_ref5 = (eff(), arr)) ? void 0 : _flatMaybeArray(_ref5).call(_ref5)) ? void 0 : _atMaybeArray(_ref4).call(_ref4, 0);
// negative: a reusable receiver keeps its bare test, and a PURE prefix is not an effect
export const a5 = arr == null ? void 0 : (eff2(), _flatMaybeArray(arr).call(arr));
export const a6 = null == (_ref6 = (0, arr)) ? void 0 : _flatMaybeArray(_ref6).call(_ref6);
// a nested instance leaf in a BODYLESS slot reads off the resolved hop, not off the init
export const b1 = (() => {
  if (cond) var m = _flatMaybeArray(arr);
  return typeof m;
})();
export const b2 = (() => {
  let i = 0;
  do var m = _flatMaybeArray(arr); while (i++ < 0);
  return typeof m;
})();
// ... while a STATIC leaf under the same hop never needed that receiver - its own pure is the value
export const b3 = (() => {
  if (cond) var o = _Array$of;
  return typeof o;
})();
// a `delete` consumer needs the SLOT: the member survives with its key swapped, and the
// iterator-method fold - which would delete nothing and call the helper besides - stands down
export const c1 = (() => {
  delete _globalThis[_Symbol$iterator];
  return 1;
})();
export const c2 = (() => {
  delete arr[_Symbol$iterator];
  return 1;
})();
// negative: the same read OUTSIDE a delete still folds
export const c3 = _getIteratorMethod(_globalThis);
export const r = [a1, a2, a3, a4, a5, a6, b1, b2, b3, c1, c2, typeof c3];