import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2;
// Parentheses around an optional call terminate the chain even with an intermediate
// non-optional hop between the parens and the outer call. The chain ends at the inner `)`,
// so `.map(...)` runs on the call RESULT and the trailing `.includes` must throw on a nullish
// result rather than fold into a short-circuit that swallows the throw into undefined. The
// inner optional call, the hop, and the outer call each emit as separate `.call(this)` steps.
const r = _includes(_ref = _mapMaybeArray(_ref2 = _flatMaybeArray(arr)?.call(arr)).call(_ref2, x => x)).call(_ref, 3);