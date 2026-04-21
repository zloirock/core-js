import _Array$from from "@core-js/pure/actual/array/from";
// Static block: `this` is the class constructor. In a subclass of Array, unshadowed
// `this.X` reads the super class's static surface. `isShadowedByClassOwnMember` checks
// own static members (not a blanket bail like for instance members) and the emission
// routes `this.X` through `resolveThisStaticMember` — same path as `super.X`, so
// `this.from([1, 2])` resolves to `Array.from` and gets polyfilled.
// `this.X` falling back to instance (e.g. `this.at` — `at` is prototype-only, no static)
// still bails: emitting `_at(this)` would treat the class constructor as an array instance
class C extends Array {
  static {
    _Array$from([1, 2]);
  }
}
const arr = _Array$from([3]);