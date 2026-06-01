// Optional `this.X?.(...)` in a static method of a subclass of Array: the `?.` is dead (the
// pure polyfill binding is always defined) so it folds, and inherited-static dispatch keeps
// `this` as the receiver - `_Array$from.call(this, x)`, identical to `super.from?.(x)`
class A extends Array {
  static maybe(x) {
    return this.from?.(x);
  }
}
A.maybe([1]);
