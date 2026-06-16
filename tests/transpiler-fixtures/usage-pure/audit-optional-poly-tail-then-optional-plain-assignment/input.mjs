// Same shape as the operator-context fixture (a polyfilled optional call, a NON-optional member
// tail, then a SURVIVING optional continuation `?.y`) but in a PLAIN ASSIGNMENT - no operator,
// unary, logical or ternary context around it. babel groups the deoptionalized prefix as
// `(guard).x` and leaves `?.y` outside the parens; unplugin renders the guard ternary without
// those parens. the two shapes are RUNTIME-EQUIVALENT (the surviving `?.y` short-circuits on the
// same nullish value either way - there is no operator to mis-bind), so this is a benign
// AST-vs-text render divergence. locked with a sidecar plus an e2e asserting identical values, so
// a future change that turns this into a semantic divergence is caught. distinct methods per line.
export function f(a, b, c) {
  const at = a?.at(-1).x?.y;
  const fl = b?.flat().x?.y;
  const fd = c?.findLast(Boolean).x?.y;
  return [at, fl, fd];
}
