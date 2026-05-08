import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// Equal-range merge sanity: arrow body wrapper + inner polyfill share [start, end]
// Compose layer must merge wrapper text containing needle exactly once into inner content
const f = x => {
  var _ref;
  return _atMaybeArray(_ref = _Array$from(x)).call(_ref, -1);
};
const g = x => {
  var _ref2, _ref3;
  return _atMaybeArray(_ref2 = _flatMaybeArray(_ref3 = _Array$from(x)).call(_ref3)).call(_ref2, -1);
};