import _at from "@core-js/pure/actual/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
class C {
  #bag = {
    at: () => null,
    flat: () => null
  };
  peek(i) {
    var _ref;
    return _at(_ref = this.#bag).call(_ref, i);
  }
  spread() {
    var _ref2;
    return _flatMaybeArray(_ref2 = this.#bag).call(_ref2);
  }
}