import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `isPropertyMember` covers ClassProperty (public) alongside ClassPrivateProperty, so the
// same fold runs for `this.box` as for `this.#box` - init `null` unions with `Array.from`
// assignment to Array, `?.at(0)` picks the array-specific polyfill variant
class Maybe {
  box = null;
  set(xs) {
    this.box = _Array$from(xs);
  }
  firstOrNull() {
    var _ref;
    return (null == (_ref = this.box) ? void 0 : _atMaybeArray(_ref).call(_ref, 0)) ?? null;
  }
}