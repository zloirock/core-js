import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// `{...o}` and similar spread sites read `o` and produce a shallow copy; no aliasing happens.
// Spread used as a value-source must stay non-mutating, otherwise every spread site would falsely leak.
const o = {
  arr: [1, 2, 3],
  test() {
    var _ref, _ref2;
    const copy = {
      ...o
    };
    const a = _atMaybeArray(_ref = this.arr).call(_ref, 0);
    const b = _includesMaybeArray(_ref2 = this.arr).call(_ref2, 0);
    return [a, b, copy];
  }
};
o.test();