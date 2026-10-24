import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// rebinding `let o` to a different literal doesn't mutate the original literal: each
// `this.arr.at(0)` call narrows by its own object's literal init, so the first uses
// array dispatch (`arr: [1, 2, 3]`) and the second uses string dispatch
let o = {
  arr: [1, 2, 3],
  test() {
    var _ref;
    return _atMaybeArray(_ref = this.arr).call(_ref, 0);
  }
};
o = {
  arr: "stringified",
  test() {
    var _ref2;
    return _atMaybeString(_ref2 = this.arr).call(_ref2, 0);
  }
};
o.test();