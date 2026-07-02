// subclass constructor calling `super(...)` with polyfilled arguments: the args are
// still scanned even though `super()` itself is preserved verbatim.
class C extends WeakMap { constructor(x) { super(); this.set(x, 1); } }
