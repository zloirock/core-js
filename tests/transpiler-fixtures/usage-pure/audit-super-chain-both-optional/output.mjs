import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
// super-chain edge: BOTH inner and outer calls optional - `super.X?.().Y?.()`. the inner
// callee receiver is `Super`, so the inner poly-chain bails, while the outer optional
// `.Y?.()` still goes through normal super-call handling. the super bail must not break the
// inner `?.flat` polyfill emission.
class C extends Array {
  m() {
    var _ref, _ref2;
    null == (_ref = super.flat) ? void 0 : _mapMaybeArray(_ref2 = _ref.call(this))?.call(_ref2, x => x);
  }
}
new C().m();