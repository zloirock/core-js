import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// class field type is inferred across every `this.<field> = X` assignment, not only
// the initializer. `#box = null` plus `this.#box = Array.from(xs)` union to Array,
// so `this.#box?.at(0)` gets the array-specific `at` polyfill (not the generic one).
class Maybe {
  #box = null;
  set(xs) {
    this.#box = _Array$from(xs);
  }
  firstOrNull() {
    var _ref;
    return (null == (_ref = this.#box) ? void 0 : _atMaybeArray(_ref).call(_ref, 0)) ?? null;
  }
}