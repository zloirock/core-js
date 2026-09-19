// inside-method `this.arr = ...` write joins the candidate union with the init type.
// Array<Number> commonType String collapses to null -> generic `_at` falls out of the
// fold, mirroring the same flow-scan discipline as class instance fields
const o = {
  arr: [1, 2, 3],
  reset() {
    this.arr = "stringified";
  },
  test() {
    return this.arr.at(0);
  }
};
o.test();
