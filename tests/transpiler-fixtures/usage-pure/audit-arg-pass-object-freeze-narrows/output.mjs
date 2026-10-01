import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// `Object.freeze(o)` locks future writes but doesn't change existing property types.
// Property-type narrowing must persist; freeze/seal/preventExtensions all stay non-mutating for tracking.
const o = {
  arr: [1, 2, 3],
  test() {
    var _ref, _ref2;
    Object.freeze(o);
    const a = _atMaybeArray(_ref = this.arr).call(_ref, 0);
    const b = _includesMaybeArray(_ref2 = this.arr).call(_ref2, 0);
    return [a, b];
  }
};
o.test();