import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// hops SWAPPED (the unresolvable window hop before the ponyfillable self hop): both optional
// objects share the window hop as their only source of undefined, so ONE nested test on the
// window prefix guards the chain and the branch still reads the ponyfill leaf
const dw = () => _globalThis;
export const viaHopOrderSwap = null == dw()?.window ? void 0 : _atMaybeArray(_ref = _Array$of(12)).call(_ref, 0);