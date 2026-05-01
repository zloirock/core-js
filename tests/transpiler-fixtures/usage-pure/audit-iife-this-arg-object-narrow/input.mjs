// IIFE arrow body referencing `this` - inherits caller `this` from the enclosing
// `test()` method. resolver walks up through the arrow to the ObjectMethod's parent
// ObjectExpression (`o`), looks up `arr` on it, finds the array literal, narrows
// `.at(0)` to the array-specific polyfill. flow scan covers `this.arr = ...` writes
// inside any non-arrow method on the same object plus module-wide `o.arr = ...` writes
// keyed off the binding name; this fixture has neither, so init type wins
const o = {
  arr: [1, 2, 3],
  test() {
    return (() => this.arr)().at(0);
  }
};
o.test();
