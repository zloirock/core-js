// super-chain edge: BOTH inner and outer call optional - `super.X?.().Y?.()`. exercises
// the super-bail path in `findInnerPolyChain` (returns null because inner callee receiver
// is `Super`) AND the addInstanceTransform's super-call handling for the outer optional
// `.Y?.()`. ensures the super-chain bail doesn't break the inner `?.flat` polyfill
class C extends Array {
  m() {
    super.flat?.().map?.(x => x);
  }
}
new C().m();
