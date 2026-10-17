import _globalThis from "@core-js/pure/actual/global-this";
import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
const g = () => _globalThis;
export const viaGuardedStaticField = null == g()?.window ? void 0 : _toFixedMaybeNumber(_Number$MAX_SAFE_INTEGER).call(_Number$MAX_SAFE_INTEGER, 2);