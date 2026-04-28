// `(this).at(0)` in an instance method where the class declares its own `at`. shadow
// check must peel parens / TS wrappers so the wrapper preserved by `createParenthesizedExpressions: true`
// (or `(this as any).at(0)`) doesn't bypass the detection. without peel, polyfill emit
// reroutes the call through `_atMaybeArray(this).call(this, 0)`, silently overriding the
// user's own `at` method
class C extends Array {
  at() {
    return 'shadowed';
  }
  foo() {
    return (this).at(0);
  }
}