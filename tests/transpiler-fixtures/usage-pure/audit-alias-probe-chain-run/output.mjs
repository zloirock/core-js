import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref;
// the claim may stand a dotted PLAIN run above a probe-holding alias: the whole run is the
// erased read (its first link dereferences the held value and throws exactly where native
// does), so the probe respells it verbatim. an SE computed key in the run has no probe
// spelling - respelling would double its effect - and the swap stands down whole instead
const heldProbe = _globalThis.window;
export const chainRunReadCall = (heldProbe.Array.of, _Array$of)(11);
export const chainRunDeep = _atMaybeArray(_ref = (heldProbe.Array.of, _Array$of)(12)).call(_ref, 0);
let seKey = 0;
export const chainSeKeyDeclined = heldProbe[seKey++, 'Array'].of(13);
export { seKey };
const heldGuardable = null == _globalThis.window ? void 0 : _self;
let seKey2 = 0;
export const chainSeKeyDeclinedGuarded = heldGuardable[seKey2++, 'Object'].freeze({
  marker: 14
});
export { seKey2 };