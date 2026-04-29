import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// private field without init (`#box;` - TDZ undefined) relies entirely on the assignment
// scan. `this.#box = Array.from(xs)` seeds the only candidate; fold yields Array and
// `.at(0)` picks the array-specific polyfill
class C {
  #box;
  load(xs) {
    this.#box = _Array$from(xs);
  }
  first() {
    var _ref;
    return _atMaybeArray(_ref = this.#box).call(_ref, 0);
  }
}