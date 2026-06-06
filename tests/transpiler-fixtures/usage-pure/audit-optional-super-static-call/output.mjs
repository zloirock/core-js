import _Array$from from "@core-js/pure/actual/array/from";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Array$of from "@core-js/pure/actual/array/of";
import _at from "@core-js/pure/actual/instance/at";
// optional call on an inherited static method (`super.from?.()`) inside a STATIC method. the inherited
// static resolves to the same always-defined polyfill as the bare form (`_Array$from`), so the `?.`
// deoptimizes and the call-split binds `this` (the subclass): `_at(_ref = _Array$from.call(this))...`.
// without recognizing the inherited static, the optional fell into the generic chain path and the
// synthetic method-call body collided with the static call-split (an unplugin composition crash).
// a super call in an INSTANCE method (prototype lookup) or a non-poly inherited static keeps its guard
export class C extends Array {
  static a() {
    var _ref;
    return _at(_ref = _Array$from.call(this)).call(_ref, 0);
  }
  static b() {
    var _ref2;
    return _flatMaybeArray(_ref2 = _Array$of.call(this)).call(_ref2);
  }
}