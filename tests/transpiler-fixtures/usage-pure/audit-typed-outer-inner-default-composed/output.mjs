import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
var _ref, _ref2, _ref3, _ref4;
// a TYPED outer slot is always defined, so its inner default never fires - the composed
// two-step extraction dispatches the LIVE outer step and folds the default through the
// canonical guard, instead of mirroring the polyfill into the dead default branch
const src = [1, [2]];
export const name = _nameMaybeFunction((_ref = _atMaybeArray(src)) === void 0 ? {} : _ref);
const sibling = _nameMaybeFunction((_ref2 = _atMaybeArray(src)) === void 0 ? {} : _ref2);
const {
  other
} = src;
// an ARRAY-pattern default binds the guard to its own pattern - same canon, array spelling
const [firstChar] = (_ref3 = _atMaybeArray(src)) === void 0 ? [] : _ref3;
const {
  at: [bareChar]
} = src;
export { firstChar, bareChar };
// a receiver-bearing default folds through the same guard - its receiver is the fallback
// exactly on the branch the runtime default fires on
const fallback = {
  name: 1
};
const viaFallback = _nameMaybeFunction((_ref4 = _atMaybeArray(src)) === void 0 ? fallback : _ref4);
export { sibling, other, viaFallback };