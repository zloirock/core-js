import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Map from "@core-js/pure/actual/map/constructor";
class A extends Array {
  last() {
    return _atMaybeArray(this).call(this, -1);
  }
}
class B extends _Map {
  lookup(k) {
    return this.get(k);
  }
}