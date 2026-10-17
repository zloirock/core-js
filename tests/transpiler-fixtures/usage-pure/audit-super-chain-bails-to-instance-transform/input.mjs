// `super.X?.().Y(args)` would lift `super` into a `(_ref = super)` memo on the
// OR-chain template, but `super` is not a primary expression and the codegen
// produces invalid JS (`null == (_ref = super)`). the combined-chain finder bails when
// the inner callee receiver is `Super`, so super chains fall through to the
// instance-transform path with its dedicated super-call handling
class C extends Array {
  m() {
    super.flat?.().map(x => x);
  }
}
new C().m();
