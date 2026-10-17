import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref;
// DEEP pristine hops over the provably pure call root: BOTH emitters drop the call and read
// the hops off the ponyfill leaf - a raw `.self` read would miss every engine
// the web.self ponyfill serves (the polyfill invariant), so the guard itself is ponyfill-backed
const dh = () => _globalThis;
export const viaDeepHops = null == _self.window ? void 0 : _atMaybeArray(_ref = _Array$of(3)).call(_ref, 0);