import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref, _ref2;
// 4-deep chain with NO optional - element-tracking resolves outer receiver to `number`,
// which has no `.at`; both babel and unplugin intentionally leave outer `.at(0)` raw.
// paired with `audit-optional-polyfill-chain-crash` which tests the optional counterpart:
// there the chain's `?.` triggers unplugin's generic-fallback retry so outer polyfills
const arr = [[[1]], [[2]]];
_atMaybeArray(_ref = _atMaybeArray(_ref2 = _atMaybeArray(arr).call(arr, 0)).call(_ref2, 0)).call(_ref, 0).at(0);