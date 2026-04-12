import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
class A extends _Map {
  static f() {
    class B extends _Set {
      static g() {
        return super.from([1]);
      }
    }
    return _Map$groupBy.call(this, [], x => x);
  }
}