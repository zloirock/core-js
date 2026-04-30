import _includes from "@core-js/pure/actual/instance/includes";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _at from "@core-js/pure/actual/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// 5 chained instance polyfills in a single arrow body - stress test for
// sortInnersInnermostLast + nth-occurrence accounting + dups handling
const f = x => {
  var _ref, _ref2, _ref3, _ref4;
  return _includes(_ref = _findLastIndexMaybeArray(_ref2 = _findLastMaybeArray(_ref3 = _at(_ref4 = _flatMaybeArray(arr).call(arr)).call(_ref4, 0)).call(_ref3, p)).call(_ref2, p2)).call(_ref, z);
};