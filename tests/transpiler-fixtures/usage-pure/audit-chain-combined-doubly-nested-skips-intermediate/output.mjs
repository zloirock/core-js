import _filterMaybeArray from "@core-js/pure/actual/array/instance/filter";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref, _ref2;
// doubly-nested optional chain: `arr.flat?.().map(...).filter?.().some(...)`. without
// the intermediate-hop skip, BOTH `.filter+.flat?.()` AND `.map+.flat?.()` would match
// findInnerPolyChain (sharing the same inner) and queue overlapping chain emits whose
// source ranges collide in compose. additionally the trailing `.some(...)` after the
// chain emit demands paren-wrap so `.some` binds to the conditional result rather than
// the success branch alone (without wrap, `cond ? void 0 : X.some(...)` strands void 0
// on the null path - babel emits the wrap, parity restores native TypeError semantics)
const arr = [1, 2];
(null == arr || null == (_ref = _flatMaybeArray(arr)) ? void 0 : _filterMaybeArray(_ref2 = _ref.call(arr))?.call(_ref2)).some(x => x === 1);