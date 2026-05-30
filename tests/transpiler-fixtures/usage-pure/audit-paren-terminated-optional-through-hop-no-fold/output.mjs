import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2;
// Parentheses around an optional call terminate the optional chain even when an
// intermediate non-optional hop sits between the parens and the outer call. The chain
// ends at the inner `)`, so `.map(...)` runs on the call RESULT and the trailing
// `.includes` must throw on a nullish result rather than fold into a short-circuiting
// chain that swallows the throw into undefined. The inner optional call, the intermediate
// hop, and the outer call must each emit as separate memoized `.call(this)` steps.
const r = _includes(_ref = _mapMaybeArray(_ref2 = _flatMaybeArray(arr)?.call(arr)).call(_ref2, x => x)).call(_ref, 3);