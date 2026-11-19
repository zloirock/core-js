import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
class C {
  static get M() {
    return _Map;
  }
  static set M(value) {}
}
use(_Map$groupBy([3], value => value));