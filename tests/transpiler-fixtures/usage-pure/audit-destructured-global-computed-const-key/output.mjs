import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _ref2;
// a global destructured through a computed CONST key names the same proxy global a literal key does,
// so a chained instance method on its static result keeps the typed dispatch. without folding the
// const key, the receiver type degrades and the chained method falls back to a generic dispatch. the
// array-wrapped form folds the key inside the positional peel too. distinct method per line.
const arrKey = "Array";
const {
  [arrKey]: A
} = _globalThis;
const [{
  [arrKey]: W
}] = [_globalThis];
export const r1 = _atMaybeArray(_ref = _Array$from([1])).call(_ref, 0);
export const r2 = _includesMaybeArray(_ref2 = _Array$of(2)).call(_ref2, 2);