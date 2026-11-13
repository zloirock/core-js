import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// Consuming a backed claim still evaluates the effectful realm receiver and its throwing read.
const effects = [];
export function read() {
  var _ref;
  return _atMaybeArray(_ref = ((_pushMaybeArray(effects).call(effects, "prefix"), _globalThis).window.Array, _Array$from)([3])).call(_ref, -1);
}