import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
class A extends _WeakMap {
  static f(k) {
    return super.getOrInsert(k, 1);
  }
}