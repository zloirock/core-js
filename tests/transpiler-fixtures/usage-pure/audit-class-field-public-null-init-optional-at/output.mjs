import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// public class field `box` initialized to `null` and later assigned `Array.from(xs)`.
// plugin widens the field's type to Array (same as for private `#box` fields) so
// `this.box?.at(0)` picks the array-specific polyfill variant
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