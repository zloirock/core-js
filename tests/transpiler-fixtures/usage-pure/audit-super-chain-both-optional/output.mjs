import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
// super-chain edge: BOTH inner and outer call optional - `super.X?.().Y?.()`. exercises
// the super-bail path in `findInnerPolyChain` (returns null because inner callee receiver
// is `Super`) AND the addInstanceTransform's super-call handling for the outer optional
// `.Y?.()`. ensures the super-chain bail doesn't break the inner `?.flat` polyfill
class C extends Array {
  m() {
    var _ref, _ref2;
    null == (_ref = super.flat) ? void 0 : _mapMaybeArray(_ref2 = _ref.call(this))?.call(_ref2, x => x);
  }
}
new C().m();