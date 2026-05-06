import _Reflect$deleteProperty from "@core-js/pure/actual/reflect/delete-property";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// `Reflect.deleteProperty(o, key)` removes own property from target (index 0). delete is a
// mutation just like add - the property may have held a value that other narrows depended
// on. flagged with `mutatesArgument: [0]`; classifier returns 'leak'
const o = {
  arr: [1, 2, 3],
  test() {
    var _ref, _ref2;
    _Reflect$deleteProperty(o, "x");
    const a = _at(_ref = this.arr).call(_ref, 0);
    const b = _includes(_ref2 = this.arr).call(_ref2, 0);
    return [a, b];
  }
};
o.test();