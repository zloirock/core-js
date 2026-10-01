import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// an OWN static shadows the inherited name: `this.from` dispatches to the user's method, so no
// always-defined polyfill backs the read and the optional KEEPS its guard (the same guarded
// combine shape as any non-polyfillable inner - native short-circuit semantics preserved even
// under a rebound `this`); the trailing instance methods still polyfill against the result and
// the user's method is called exactly once
class C extends Array {
  static from(x) {
    return [9, ...x];
  }
  static make() {
    var _ref, _ref2, _ref3;
    return null == (_ref = this.from) ? void 0 : _atMaybeArray(_ref2 = _flatMaybeArray(_ref3 = _ref.call(this, [1, 2])).call(_ref3)).call(_ref2, 0);
  }
}
export const r = C.make();