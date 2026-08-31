import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3, _ref4;
// the `?.` deopt asks the CANON which global its receiver names, never the raw spelling: a bound
// alias of a global is the same always-defined static as the direct form, so the guard dies with the
// substitution. classifying by name - bound means "not a global" - kept a guard over the polyfill the
// same pass had just substituted under it. the negatives keep it: a reassigned alias narrows only
// under a ctor identity test, and a local object is no global at all
const A = Array;
export const aliasStatic = _atMaybeArray(_ref = _Array$from([1])).call(_ref, -1);
export const directStatic = _atMaybeArray(_ref2 = _Array$from([2])).call(_ref2, -1);
let R = Array;
R = Object;
export const reassigned = null == (_ref3 = R === Array ? _Array$from : R.from) ? void 0 : _at(_ref4 = _ref3.call(R, [3])).call(_ref4, -1);
const local = {
  from: xs => xs
};
export const localObject = local.from?.([4]);