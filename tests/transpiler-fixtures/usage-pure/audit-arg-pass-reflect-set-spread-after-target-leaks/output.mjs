import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _Reflect$set from "@core-js/pure/actual/reflect/set";
// Spread `...o` at arg index 2 of `Reflect.set` can land on the mutating receiver slot 3 at runtime.
// Spread widening must reach any annotated index >= position, otherwise this case would falsely narrow.
const target = {};
const o = {
  arr: [1, 2, 3],
  test() {
    var _ref, _ref2;
    _Reflect$set(target, "x", ...o);
    const a = _at(_ref = this.arr).call(_ref, 0);
    const b = _includes(_ref2 = this.arr).call(_ref2, 0);
    return [a, b];
  }
};
o.test();