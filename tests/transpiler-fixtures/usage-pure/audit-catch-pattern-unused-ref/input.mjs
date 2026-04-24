// `try {} catch ({ code }) {}` - the destructured name `code` is never read in the catch body,
// so there is no polyfillable operation to rewrite and no reason to touch the catch param.
// plugin must leave the source as-is instead of extracting into `catch (_ref) { let {code} = _ref }`
try {
  risky();
} catch ({ code }) {
  // code destructured but never used - no polyfill candidate in the body
}
