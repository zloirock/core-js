import _includes from "@core-js/pure/actual/instance/includes";
// catch destructure body-usage check: `MemberExpression.property` Identifier matches
// the binding name lexically but is not a runtime reference (`Math.includes` reads the
// property `includes` off `Math`, doesn't bind to the catch's `includes`). The non-
// reference-position filter rejects member-tail Identifiers, leaving the catch
// destructure intact - `Math.includes` still flows through the regular instance-polyfill
// emit, but the catch transform doesn't fire on a phantom binding ref
try {
  risky();
} catch ({
  includes
}) {
  _includes(Math);
}