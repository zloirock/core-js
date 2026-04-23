import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// class field type is folded across all `this.<field> = X` assignments, not just the init.
// `#box = null` + `this.#box = Array.from(xs)` unions to Array, selecting `_atMaybeArray`.
// init-only inference would either skip polyfill (nullable short-circuit in
// resolveCallReturnType) or pick the generic `_at` variant
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