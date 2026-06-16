import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// Same shape as the operator-context fixture (a polyfilled optional call, a NON-optional member
// tail, then a SURVIVING optional continuation `?.y`) but in a PLAIN ASSIGNMENT - no operator,
// unary, logical or ternary context around it. babel groups the deoptionalized prefix as
// `(guard).x` and leaves `?.y` outside the parens; unplugin renders the guard ternary without
// those parens. the two shapes are RUNTIME-EQUIVALENT (the surviving `?.y` short-circuits on the
// same nullish value either way - there is no operator to mis-bind), so this is a benign
// AST-vs-text render divergence. locked with a sidecar plus an e2e asserting identical values, so
// a future change that turns this into a semantic divergence is caught. distinct methods per line.
export function f(a, b, c) {
  const at = (a == null ? void 0 : _at(a).call(a, -1).x)?.y;
  const fl = (b == null ? void 0 : _flatMaybeArray(b).call(b).x)?.y;
  const fd = (c == null ? void 0 : _findLastMaybeArray(c).call(c, Boolean).x)?.y;
  return [at, fl, fd];
}