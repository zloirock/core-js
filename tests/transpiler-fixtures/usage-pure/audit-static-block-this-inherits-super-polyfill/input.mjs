// Static block: `this` is the class constructor. In a subclass of Array, unshadowed
// `this.X` reads the super class's static surface, so `this.from([1, 2])` resolves to
// `Array.from` and is emitted as `_Array$from.call(this, ...)` (same as `super.from`), so
// the subclass stays the receiver; a top-level `Array.from(...)` global call stays bare.
// `this.X` falling back to instance (e.g. `this.at` - prototype-only, no static) bails:
// treating the class constructor as an array instance would be semantically wrong
class C extends Array {
  static {
    this.from([1, 2]);
  }
}
const arr = Array.from([3]);
