import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref;
// STACKED unresolvable hops under an SE key: the guard tests the DEEPER PREFIX
// (`_globalThis.window?.window`, the plan's own node) - descending to the bottom probe
// would drop the source's `?.` from the test and split the emitters on the boundary.
const log = [];
const v = null == (null == _globalThis.window?.window ? void 0 : (_pushMaybeArray(log).call(log, "k"), _self)) ? void 0 : _atMaybeArray(_ref = _Array$of(7)).call(_ref, 0);
use(v, log);