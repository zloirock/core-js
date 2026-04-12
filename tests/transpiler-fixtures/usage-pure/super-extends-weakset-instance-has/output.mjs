import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
class A extends _WeakSet {
  static f() {
    return super.has(1);
  }
}