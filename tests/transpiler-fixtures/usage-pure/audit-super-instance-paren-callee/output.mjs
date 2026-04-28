// paren-wrapped variant of the same conservative skip. pins that `createParenthesizedExpressions: true`
// doesn't accidentally route the call through `_includes.call(this, x)` once the
// `ParenthesizedExpression` wrapper above `super.includes` is peeled
class C extends Array {
  foo(x) {
    return (super.includes)(x);
  }
}