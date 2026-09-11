// polyfilled optional call, NON-optional member tail, then a SURVIVING optional continuation
// `?.y`, in a PLAIN ASSIGNMENT (no operator context). babel parenthesizes the deoptionalized
// prefix as `(guard).x` with `?.y` outside; unplugin omits those parens. with no operator to
// mis-bind the two are RUNTIME-EQUIVALENT - a benign render divergence locked by sidecar + e2e.
export function f(a, b, c) {
  const at = a?.at(-1).x?.y;
  const fl = b?.flat().x?.y;
  const fd = c?.findLast(Boolean).x?.y;
  return [at, fl, fd];
}
