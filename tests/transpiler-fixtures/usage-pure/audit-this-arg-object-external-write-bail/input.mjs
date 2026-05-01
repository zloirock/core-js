// module-wide `o.arr = ...` write keyed on the binding name. external-write index
// drops a String candidate into the union; commonType against Array<Number> collapses
// to null and the polyfill stays generic. parallels `instance.field = ...` external
// writes for class fields
const o = {
  arr: [1, 2, 3],
  test() {
    return this.arr.at(0);
  }
};
o.arr = "stringified";
o.test();
