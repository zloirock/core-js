import _Reflect$set from "@core-js/pure/actual/reflect/set";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// `Reflect.set(o, ...)` 3-arg form mutates the target slot, so the alias narrow on `o.arr` must drop.
// Mirrors `Object.assign` target-leak via the Reflect lookup path.
const o = {
  arr: [1, 2, 3],
  test() {
    var _ref, _ref2;
    _Reflect$set(o, "x", 1);
    const a = _at(_ref = this.arr).call(_ref, 0);
    const b = _includes(_ref2 = this.arr).call(_ref2, 0);
    return [a, b];
  }
};
o.test();