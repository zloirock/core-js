// `this['from']([1])` with string-literal computed key - `staticKeyName` accepts
// string-literal computed keys via `t.isStringLiteral`. This is semantically identical
// to `this.from([1])` at runtime. Plugin should polyfill as Array.from.
class C extends Array {
  static {
    this['from']([1, 2, 3]);
  }
}
