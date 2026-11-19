import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// `Object.defineProperty(o, ...)` mutates the target slot, so the alias narrow on `o.arr` must drop.
// Confirms the singular-variant entry mirrors the same mutating-slot annotation as `Object.assign`.
const o = {
  arr: [1, 2, 3],
  test() {
    var _ref, _ref2;
    Object.defineProperty(o, "x", {
      value: 1
    });
    const a = _at(_ref = this.arr).call(_ref, 0);
    const b = _includes(_ref2 = this.arr).call(_ref2, 0);
    return [a, b];
  }
};
o.test();