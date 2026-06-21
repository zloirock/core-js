import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// IIFE arrow body referencing `this` - inherits caller `this` from the enclosing `test()`
// method, so `this.arr` resolves to the enclosing ObjectExpression `o`, finds the array
// literal init, and narrows `.at(0)` to the array-specific polyfill. no `this.arr = ...`
// or `o.arr = ...` rebinding writes exist here, so the init type wins.
const o = {
  arr: [1, 2, 3],
  test() {
    var _ref;
    return _atMaybeArray(_ref = (() => this.arr)()).call(_ref, 0);
  }
};
o.test();