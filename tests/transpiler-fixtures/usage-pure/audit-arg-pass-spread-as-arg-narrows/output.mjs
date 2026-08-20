import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// `{ ...o }` copies o's enumerable own props into a NEW object - including the own-this method,
// whose shared body later runs with `this` = the copy (`copy.test()`), a receiver this closure
// does not track. the this-field narrow must bail to the generic helpers. pairs with the
// Math.max(...o) fixture: array / call-argument spread only ITERATES and keeps the narrow
const o = {
  arr: [1, 2, 3],
  test() {
    var _ref, _ref2;
    const copy = {
      ...o
    };
    const a = _at(_ref = this.arr).call(_ref, 0);
    const b = _includes(_ref2 = this.arr).call(_ref2, 0);
    return [a, b, copy];
  }
};
o.test();