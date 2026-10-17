import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// a DESTRUCTURE over the swapped-hop chain: the guard tests the SHORTEST object carrying the
// unresolvable hop (the window prefix), never a raw ponyfillable hop read; the helper receives
// the guarded value and keeps the native throw on the short-circuit path
const dsw = () => _globalThis;
const pickedSwapAt = _atMaybeArray(null == dsw().window ? void 0 : _Array$of(23));
export const viaDestructureOverSwap = pickedSwapAt;