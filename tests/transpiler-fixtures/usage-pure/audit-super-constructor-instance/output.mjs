import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// subclass constructor calling `super(...)` with polyfilled arguments: the args are
// still scanned even though `super()` itself is preserved verbatim.
class C extends _WeakMap {
  constructor(x) {
    super();
    this.set(x, 1);
  }
}