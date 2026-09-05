import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Set from "@core-js/pure/actual/set/constructor";
// a computed STRING-LITERAL key is as deterministic as the plain form: the pre-pass
// registers the ctor alias, so a member read inside an EARLIER-DEFINED closure still
// resolves (the guarded fold self-corrects at runtime); the late read folds directly
function early() {
  return (M === _Map ? _Map$groupBy : M.groupBy.bind(M))(['a'], x => x);
}
var M = _Map;
export const viaEarly = early();
export const viaLate = _Map$groupBy(['b'], x => x);

// a const string-literal alias as the key resolves through the funnel's init-following
// canon - registration is not the only route for the LATE read
const pick = 'Set';
const S = _Set;
export const viaConstKey = typeof S;

// a genuinely DYNAMIC key (function parameter) stays unresolved - no registration, the
// read keeps the user value
function viaParam(key) {
  const {
    [key]: D
  } = _globalThis;
  return typeof D;
}
export const viaDynamic = viaParam('WeakSet');