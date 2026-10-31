import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _Reflect$set from "@core-js/pure/actual/reflect/set";
// `Reflect.set(target, key, value, receiver)` 4-arg form: the write lands on the receiver slot.
// Both target and receiver positions must be flagged so the alias narrow on `o` drops in either role.
const target = {};
const o = {
  arr: [1, 2, 3],
  test() {
    var _ref, _ref2;
    _Reflect$set(target, "x", 1, o);
    const a = _at(_ref = this.arr).call(_ref, 0);
    const b = _includes(_ref2 = this.arr).call(_ref2, 0);
    return [a, b];
  }
};
o.test();