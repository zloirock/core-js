import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _ref2, _ref3;
// Combined optional-call chains over a DOUBLE-hop kept-assign claim: the claim's root guard must not ride into a helper-GET
// argument or under a raw member read (a throw where native short-circuits) - it hoists into the outer test / over the raw tail on
// both emitters.
let n;
export const combinedTail = null == (n = _globalThis.window) || null == (_ref = _flatMaybeArray(_ref2 = _Array$of(1))) ? void 0 : _atMaybeArray(_ref3 = _ref.call(_ref2))?.call(_ref3, 0);