import _includes from "@core-js/pure/actual/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
// Deeply nested arrow body with chained instance methods stresses the compose loop:
// outer arrow wrap + 3 inner polyfills, all sharing the same root receiver.
// Phase 1 sortInnersInnermostLast + nth-occurrence accounting must keep emission stable
const f = x => {
  var _ref, _ref2;
  return _includes(_ref = _at(_ref2 = _flatMaybeArray(arr).call(arr)).call(_ref2, 0)).call(_ref, 1);
};
const g = x => {
  var _ref3;
  return _findLastMaybeArray(_ref3 = _flatMaybeArray(arr).call(arr)).call(_ref3, p);
};
const h = x => {
  var _ref4;
  return _findLastIndexMaybeArray(_ref4 = _flatMaybeArray(arr).call(arr)).call(_ref4, p);
};