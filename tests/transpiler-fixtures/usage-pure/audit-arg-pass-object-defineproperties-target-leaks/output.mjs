import _Object$defineProperties from "@core-js/pure/actual/object/define-properties";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// `Object.defineProperties(o, ...)` mutates the target slot, so the alias narrow on `o.arr` must drop.
// Confirms the plural variant carries the same mutating-slot annotation as the singular one.
const o = {
  arr: [1, 2, 3],
  test() {
    var _ref, _ref2;
    _Object$defineProperties(o, {
      x: {
        value: 1
      }
    });
    const a = _at(_ref = this.arr).call(_ref, 0);
    const b = _includes(_ref2 = this.arr).call(_ref2, 0);
    return [a, b];
  }
};
o.test();