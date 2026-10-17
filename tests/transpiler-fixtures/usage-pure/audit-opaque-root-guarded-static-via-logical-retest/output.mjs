import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref;
// a LOGICAL retest spells each leg through the same nested canon - the left leg keeps its own
// guarded read, the right leg guards the dispatch
const lg = () => _globalThis;
export const viaLogicalRetest = (null == lg().window ? void 0 : _self) && (null == lg()?.window ? void 0 : _atMaybeArray(_ref = _Array$of(30)).call(_ref, 0));