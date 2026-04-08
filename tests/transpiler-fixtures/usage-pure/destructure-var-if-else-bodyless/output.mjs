import _Promise from "@core-js/pure/actual/promise/constructor";
import _Map from "@core-js/pure/actual/map/constructor";
if (cond) {
  noop();
} else {
  var Promise = _Promise;
  var Map = _Map;
}