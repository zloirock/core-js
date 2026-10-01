import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
class A extends _Map {
  static f(it, k) {
    return _Map$groupBy.call(this, it, k);
  }
}