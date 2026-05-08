import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// `Object.setPrototypeOf(o, ...)` only rewires `[[Prototype]]`; it can't change types of own properties.
// Own slots always shadow inherited at read time, so the alias narrow on `o.arr` is unaffected.
const o = {
  arr: [1, 2, 3],
  test() {
    var _ref, _ref2;
    Object.setPrototypeOf(o, null);
    const a = _atMaybeArray(_ref = this.arr).call(_ref, 0);
    const b = _includesMaybeArray(_ref2 = this.arr).call(_ref2, 0);
    return [a, b];
  }
};
o.test();