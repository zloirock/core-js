import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
class C extends _WeakMap {
  constructor(x) {
    super();
    this.set(x, 1);
  }
}