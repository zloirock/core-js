// catch destructure body-usage check, OPTIONAL-member-tail variant of the plain member-access
// case: `Math?.includes` reads the `includes` property through an optional chain. babel models the
// tail as OptionalMemberExpression (estree folds it into a plain MemberExpression); the
// non-reference filter must reject the optional tail too, else babel alone forces a phantom catch
// extraction and diverges from the unplugin twin
try {
  risky();
} catch ({ includes }) {
  Math?.includes;
}
