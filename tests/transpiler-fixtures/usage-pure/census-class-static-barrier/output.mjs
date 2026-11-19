import _Map from "@core-js/pure/actual/map";
class C {
  static M = _Map;
  static {}
}
use(C.M.groupBy([3], value => value));