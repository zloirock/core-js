import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2;
// STACKED unresolvable hops under an SE key: the guard tests the DEEPER PREFIX
// (`_globalThis.window?.window`, the plan's own node) - descending to the bottom probe
// would drop the source's `?.` from the test and split the emitters on the boundary.
// the text sidecar records the accepted lag of that layer (the corpus textLags class):
// the claim inside the kept computed key is re-emitted raw there
const log = [];
const v = null == (_ref = null == _globalThis.window?.window ? void 0 : (log.push("k"), _self)) ? void 0 : _atMaybeArray(_ref2 = _Array$of(7)).call(_ref2, 0);
use(v, log);