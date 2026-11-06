import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _Object$assign from "@core-js/pure/actual/object/assign";
// A leading spread in `Object.assign(...sources, o)` makes `o`'s runtime index unknown.
// Empty `sources` would shift `o` into the mutating target slot, so the call must conservatively leak.
const sources = [];
const o = {
  arr: [1, 2, 3],
  test() {
    var _ref, _ref2;
    _Object$assign(...sources, o);
    const a = _at(_ref = this.arr).call(_ref, 0);
    const b = _includes(_ref2 = this.arr).call(_ref2, 0);
    return [a, b];
  }
};
o.test();