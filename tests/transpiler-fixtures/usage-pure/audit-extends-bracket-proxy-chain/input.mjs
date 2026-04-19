// `globalThis['self'].Promise` - bracket-computed intermediate proxy link.
// `memberPropertyName` helper handles computed StringLiteral / `Literal` (ESTree) keys,
// so the walk still recognises `self` as a POSSIBLE_GLOBAL_OBJECTS member
class C extends globalThis['self'].Promise {
  static run(r) { return super.try(r); }
}
