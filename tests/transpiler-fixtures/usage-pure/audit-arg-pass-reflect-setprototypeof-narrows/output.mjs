import _Reflect$setPrototypeOf from "@core-js/pure/actual/reflect/set-prototype-of";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// `Reflect.setPrototypeOf(o, ...)` only rewires `[[Prototype]]`, leaving own properties intact.
// The alias narrow on `o.arr` must persist; Reflect mirror behaves like the Object companion.
const o = {
  arr: [1, 2, 3],
  test() {
    var _ref, _ref2;
    _Reflect$setPrototypeOf(o, null);
    const a = _atMaybeArray(_ref = this.arr).call(_ref, 0);
    const b = _includesMaybeArray(_ref2 = this.arr).call(_ref2, 0);
    return [a, b];
  }
};
o.test();