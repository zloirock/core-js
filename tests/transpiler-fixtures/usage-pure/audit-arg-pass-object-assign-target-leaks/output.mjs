import _Object$assign from "@core-js/pure/actual/object/assign";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// `Object.assign(o, ...)` mutates the target slot, so the alias narrow on `o.arr` must be abandoned.
// Generic instance polyfills are required because runtime shape may diverge from the property init.
const o = {
  arr: [1, 2, 3],
  test() {
    var _ref, _ref2;
    _Object$assign(o, {
      x: 1
    });
    const a = _at(_ref = this.arr).call(_ref, 0);
    const b = _includes(_ref2 = this.arr).call(_ref2, 0);
    return [a, b];
  }
};
o.test();