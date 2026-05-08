import _Object$assign from "@core-js/pure/actual/object/assign";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// Spread `...o` at arg index 1 of `Object.assign` cannot reach the mutating slot 0 at runtime.
// Spread widening must be forward-only, otherwise every spread call would falsely leak.
const target = {};
const o = {
  arr: [1, 2, 3],
  test() {
    var _ref, _ref2;
    _Object$assign(target, ...o);
    const a = _atMaybeArray(_ref = this.arr).call(_ref, 0);
    const b = _includesMaybeArray(_ref2 = this.arr).call(_ref2, 0);
    return [a, b];
  }
};
o.test();