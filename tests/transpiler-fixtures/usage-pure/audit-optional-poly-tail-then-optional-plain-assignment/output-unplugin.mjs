import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// polyfilled optional call, NON-optional member tail, then a SURVIVING optional continuation
// `?.y`, in a PLAIN ASSIGNMENT (no operator context). babel parenthesizes the deoptionalized
// prefix as `(guard).x` with `?.y` outside; unplugin omits those parens. with no operator to
// mis-bind the two are RUNTIME-EQUIVALENT - a benign render divergence locked by sidecar + e2e.
export function f(a, b, c) {
  const at = a == null ? void 0 : _at(a).call(a, -1).x?.y;
  const fl = b == null ? void 0 : _flatMaybeArray(b).call(b).x?.y;
  const fd = c == null ? void 0 : _findLastMaybeArray(c).call(c, Boolean).x?.y;
  return [at, fl, fd];
}