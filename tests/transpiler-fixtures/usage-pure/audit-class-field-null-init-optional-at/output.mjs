import _Array$from from "@core-js/pure/actual/array/from";
import _at from "@core-js/pure/actual/instance/at";
// `#box = null` is a sentinel init - real assignments happen in `set`. resolveClassMemberNode
// must drop nullable-only inits to unknown, else the nullable-receiver short-circuit in
// resolveCallReturnType skips polyfill emission for `this.#box?.at(0)` entirely
class Maybe {
  #box = null;
  set(xs) {
    this.#box = _Array$from(xs);
  }
  firstOrNull() {
    var _ref;
    return (null == (_ref = this.#box) ? void 0 : _at(_ref).call(_ref, 0)) ?? null;
  }
}