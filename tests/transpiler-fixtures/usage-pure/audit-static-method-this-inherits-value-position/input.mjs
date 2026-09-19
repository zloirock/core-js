// `this.X` read in VALUE position (not directly called) inside a static method of a subclass
// of Array: like native, detaching the inherited static loses the `this` binding, so it is
// emitted as bare `_Array$from` (no `.call(this)`); calling `f([1])` later defaults to Array
class A extends Array {
  static make() {
    const f = this.from;
    return f([1]);
  }
}
A.make();
