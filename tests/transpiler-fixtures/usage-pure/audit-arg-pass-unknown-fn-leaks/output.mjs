import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// User-defined functions are unknown to the mutating-slot allowlist, so they must default to leak.
// `unknownFn` could rebind `o.arr` to any value, hence the alias narrow has to drop.
const o = {
  arr: [1, 2, 3],
  test() {
    var _ref, _ref2;
    unknownFn(o);
    const a = _at(_ref = this.arr).call(_ref, 0);
    const b = _includes(_ref2 = this.arr).call(_ref2, 0);
    return [a, b];
  }
};
function unknownFn(p) {
  p.arr = "stringified";
}
o.test();