// `(this).at(0)` in a static method - some parsers preserve a paren wrapper around
// `this` as an AST node, others strip it. Parens are peeled so this is recognised as
// `this`-in-static (Array.at on the Array constructor - bails since Array.at is
// instance-only). Peeling makes both parser shapes produce identical bail and keeps
// the receiver routed through the static-lookup classifier rather than the
// instance-fallback path
class C extends Array {
  static run() { return (this).at(0); }
}