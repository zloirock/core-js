import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// `Math.max(...o)` spreads into a callee with no mutating slots, so the alias narrow on `o.arr` survives.
// Pairs with the value-source spread fixture: same conclusion via the call-with-non-mutating-callee path.
const o = {
  arr: [1, 2, 3],
  test() {
    var _ref, _ref2;
    Math.max(...o);
    const a = _atMaybeArray(_ref = this.arr).call(_ref, 0);
    const b = _includesMaybeArray(_ref2 = this.arr).call(_ref2, 0);
    return [a, b];
  }
};
o.test();