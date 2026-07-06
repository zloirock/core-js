import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _Object$assign from "@core-js/pure/actual/object/assign";
// `Object.assign(target, o)` mutates only the target slot (per-index granularity: a mutating
// callee doesn't bail every arg), BUT it copies o's enumerable own props - including the own-this
// method - onto the target: the shared method body later runs with `this` = target, whose fields
// this closure does not track. the this-field narrow must bail to the generic helpers
const target = {};
const o = {
  arr: [1, 2, 3],
  test() {
    var _ref, _ref2;
    _Object$assign(target, o);
    const a = _at(_ref = this.arr).call(_ref, 0);
    const b = _includes(_ref2 = this.arr).call(_ref2, 0);
    return [a, b];
  }
};
o.test();