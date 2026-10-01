import _at from "@core-js/pure/actual/instance/at";
// inside-method `this.arr = ...` write joins the candidate union with the init type.
// Array<Number> commonType String collapses to null -> generic `_at` falls out of the
// fold, mirroring the same flow-scan discipline as class instance fields
const o = {
  arr: [1, 2, 3],
  reset() {
    this.arr = "stringified";
  },
  test() {
    var _ref;
    return _at(_ref = this.arr).call(_ref, 0);
  }
};
o.test();