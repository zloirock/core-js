import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// a namespace declared BEFORE a same-name real declaration in the hoist-target scope anchors
// the merged binding on the namespace declarator; the real declaration survives only as a
// declaration-violation. a use outside the block must re-anchor onto the real declaration and
// keep its narrow (the namespace-second order already narrows through the phantom filter)
namespace N {
  export const s = [1, 2];
}
const s = "abc";
export const r = _includesMaybeString(s).call(s, "a");

// inside the block the namespace-local declaration itself narrows - region visibility holds
namespace M {
  export const q = [3, 4];
  export const first = _atMaybeArray(q).call(q, 0);
}
export const f = M.first;

// a reassigned twin still narrows through the re-anchored binding's surviving write list
namespace K {
  export let w = [5];
}
let w = "abc";
w = "xyz";
export const rw = _includesMaybeString(w).call(w, "x");

// an over-hoisted namespace local shadows nothing OUTSIDE its block even across a function
// scope: the walk continues ABOVE the invisible binding to the outer declaration, so the
// outer narrow survives (a dead-end here degraded to generic dispatch)
const t = "abcdef";
function outerReader() {
  namespace P {
    export const t = [7, 8];
  }
  return _atMaybeString(t).call(t, -1);
}
export const last = outerReader();