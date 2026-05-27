// Plain Identifier param with AssignmentPattern default-value `[1, 2, 3]`. babel binds
// the param to the AssignmentPattern wrapper (binding.path.node === AssignmentPattern,
// mirroring the RestElement param convention), so resolveBindingType inspects the
// `.right` slot and narrows `x` to Array via the default's type. polyfill emits the
// Array-specific helper instead of the generic dispatch
function head(x = [1, 2, 3]) {
  return x.at(0);
}
head();
