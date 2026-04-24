import _Array$from from "@core-js/pure/actual/array/from";
// computed super-member `super['from']` - different AST shape (computed=true, property is
// StringLiteral), should resolve the same polyfill as dot-super `super.from`
class X extends Array {
  static make() {
    return _Array$from.call(this, [1, 2]);
  }
}