// `(this).at(0)` in a static method - some parsers keep a paren wrapper around `this`
// as an AST node, others strip it. Peeling parens makes both shapes recognise the
// receiver as `this`-in-static (Array.at on the Array constructor), so both bail
// identically since Array.at is instance-only and never resolves on the static side
class C extends Array {
  static run() { return (this).at(0); }
}