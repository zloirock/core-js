import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// an SE-prefixed computed key folding to a name SHADOWED by an OWN static keeps its guard: the
// dispatch target is the user's method, no always-defined polyfill backs the read, so the
// optional call must preserve native short-circuit semantics; the key effect still runs exactly
// once and the trailing instance methods polyfill against the user's result. the emitters
// agree semantically but render the kept key differently (verbatim computed key vs a fold with
// the effect hoisted) - the object evaluation between them is unobservable
let effects = 0;
class C extends Array {
  static from(x) {
    return [9, ...x];
  }
  static make() {
    var _ref, _ref2, _ref3;
    return null == (_ref = this[effects++, 'from']) ? void 0 : _atMaybeArray(_ref2 = _flatMaybeArray(_ref3 = _ref.call(this, [1, 2])).call(_ref3)).call(_ref2, 0);
  }
}
export const r = [C.make(), effects];