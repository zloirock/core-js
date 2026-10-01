// computed super-member `super['from']` - different AST shape (computed=true, property is
// StringLiteral), should resolve the same polyfill as dot-super `super.from`
class X extends Array {
  static make() { return super['from']([1, 2]); }
}
