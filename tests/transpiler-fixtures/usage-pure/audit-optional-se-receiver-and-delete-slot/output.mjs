import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Array$of from "@core-js/pure/actual/array/of";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
var _ref;
// three shapes the differential caught while the fixture gate stayed green - each one a
// claim the engine used to DROP or fold wrong:
// an optional dispatch over an SE-bearing sequence receiver, a nested instance leaf in a bodyless
// slot, and a `delete` whose target must stay a member read
const arr = [3, [1, 2]];
// the stable receiver can be reused; its own prefix runs once in the guard's test,
// and only the KEY's effects stay in the alternate
export const a1 = null == (eff(), arr) ? void 0 : _flatMaybeArray(arr).call(arr);
export const a2 = null == (eff(), arr) ? void 0 : _atMaybeArray(arr).call(arr, 1);
export const a3 = null == (eff(), arr) ? void 0 : (eff2(), _flatMaybeArray(arr).call(arr));
export const a4 = null == (_ref = null == (eff(), arr) ? void 0 : _flatMaybeArray(arr).call(arr)) ? void 0 : _atMaybeArray(_ref).call(_ref, 0);
// negative: a reusable receiver keeps its bare test, and a PURE prefix is not an effect
export const a5 = arr == null ? void 0 : (eff2(), _flatMaybeArray(arr).call(arr));
export const a6 = null == (0, arr) ? void 0 : _flatMaybeArray(arr).call(arr);
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
  if (cond) var {
    Array: {
      of: o
    }
  } = {
    Array: {
      of: _Array$of
    }
  };
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