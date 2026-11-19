import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// `Object.keys(o)` is a pure read, so the alias narrow on `o.arr` survives across the call.
// Both `.at` and `.includes` must pick the array-narrow polyfill, not the generic instance fallback.
const o = {
  arr: [1, 2, 3],
  test() {
    var _ref, _ref2;
    Object.keys(o);
    const a = _atMaybeArray(_ref = this.arr).call(_ref, 0);
    const b = _includesMaybeArray(_ref2 = this.arr).call(_ref2, 0);
    return [a, b];
  }
};
o.test();