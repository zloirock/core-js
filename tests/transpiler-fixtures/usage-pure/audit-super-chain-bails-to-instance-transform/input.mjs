// `super.X?.().Y(args)` would lift `super` into a `(_ref = super)` memo on the
// OR-chain template, but `super` is not a primary expression and the codegen
// produces invalid JS (`null == (_ref = super)`). findInnerPolyChain bails when
// the inner callee receiver is `Super`, so super chains fall through to the
// addInstanceTransform path with its dedicated super-call handling
class C extends Array {
  m() {
    super.flat?.().map(x => x);
  }
}
new C().m();
