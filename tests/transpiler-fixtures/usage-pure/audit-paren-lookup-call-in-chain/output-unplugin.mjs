import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2;
// call in the middle of optional chain: `(getObj()?.a.includes)(1)`. extractCheck
// memoizes the call expression's receiver via _ref so getObj() evaluates once even
// across the deopt walk + paren-lookup throw guard
declare const getObj: () => { a: number[] } | null;
const r = (null == (_ref = getObj()) ? void 0 : _includesMaybeArray(_ref2 = _ref.a)).call(_ref2, 1);