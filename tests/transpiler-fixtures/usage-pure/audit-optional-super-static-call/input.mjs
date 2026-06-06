// optional call on an inherited static method (`super.from?.()`) inside a STATIC method. the inherited
// static resolves to the same always-defined polyfill as the bare form (`_Array$from`), so the `?.`
// deoptimizes and the call-split binds `this` (the subclass): `_at(_ref = _Array$from.call(this))...`.
// without recognizing the inherited static, the optional fell into the generic chain path and the
// synthetic method-call body collided with the static call-split (an unplugin composition crash).
// a super call in an INSTANCE method (prototype lookup) or a non-poly inherited static keeps its guard
export class C extends Array {
  static a() {
    return super.from?.().at(0);
  }

  static b() {
    return super.of?.().flat();
  }
}
