import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
if (cond) {
  Promise = _Promise;
  Map = _Map;
}