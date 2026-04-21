import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$from from "@core-js/pure/actual/array/from";
// arrow body wrapper + static polyfill share range → mergeEqualRange path.
// polyfill binding name `_Array$from` contains `$` — function-form replace must pass it through
const f = x => {
  var _ref;
  return _atMaybeArray(_ref = _Array$from(x)).call(_ref, 0);
};