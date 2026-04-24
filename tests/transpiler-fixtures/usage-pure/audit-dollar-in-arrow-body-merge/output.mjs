import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$from from "@core-js/pure/actual/array/from";
// arrow body with a static polyfill (`Array.from`) chained into an instance polyfill (`.at`)
// on the same source range - the `$` inside the generated binding name must be emitted as-is
const f = x => {
  var _ref;
  return _atMaybeArray(_ref = _Array$from(x)).call(_ref, 0);
};