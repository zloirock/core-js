import _Array$from from "@core-js/pure/actual/array/from";
// Static block: `this` is the class constructor. In a subclass of Array, unshadowed
// `this.from([1, 2])` reads the super static surface, resolves to `Array.from`, and emits
// `_Array$from.call(this, ...)` so the subclass stays receiver; top-level `Array.from(...)`
// stays bare. `this.at` (prototype-only, no static) bails - the ctor is not an instance.
class C extends Array {
  static {
    _Array$from.call(this, [1, 2]);
  }
}
const arr = _Array$from([3]);