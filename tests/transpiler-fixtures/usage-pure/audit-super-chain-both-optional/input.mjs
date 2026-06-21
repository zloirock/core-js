// super-chain edge: BOTH inner and outer calls optional - `super.X?.().Y?.()`. the inner
// callee receiver is `Super`, so the inner poly-chain bails, while the outer optional
// `.Y?.()` still goes through normal super-call handling. the super bail must not break the
// inner `?.flat` polyfill emission.
class C extends Array {
  m() {
    super.flat?.().map?.(x => x);
  }
}
new C().m();
