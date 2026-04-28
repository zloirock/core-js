// catch destructure body-usage check: `MemberExpression.property` Identifier matches the
// binding name lexically but isn't a runtime reference (`Math.includes` reads the property
// `includes` off `Math`, doesn't bind to the catch's `includes`). pre-fix `walkAstNodes`
// counted it as a reference and triggered the catch transform; post-fix the
// `isNonReferencePosition` filter rejects member-tail Identifiers, leaving the catch
// destructure intact (the `Math.includes` access still gets its own member-call rewrite
// from the regular instance-polyfill emit, but the catch destructure stays untouched)
try {
  risky();
} catch ({ includes }) {
  Math.includes;
}
