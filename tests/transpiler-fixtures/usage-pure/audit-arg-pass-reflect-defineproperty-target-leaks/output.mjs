import _Reflect$defineProperty from "@core-js/pure/actual/reflect/define-property";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// `Reflect.defineProperty(o, key, desc)` mutates target (index 0). Reflect API mirror of
// Object.defineProperty - same `mutatesArgument: [0]` annotation drives the same 'leak'
// classification path
const o = {
  arr: [1, 2, 3],
  test() {
    var _ref, _ref2;
    _Reflect$defineProperty(o, "x", {
      value: 1
    });
    const a = _at(_ref = this.arr).call(_ref, 0);
    const b = _includes(_ref2 = this.arr).call(_ref2, 0);
    return [a, b];
  }
};
o.test();