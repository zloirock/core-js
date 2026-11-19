import _globalThis from "@core-js/pure/actual/global-this";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _self from "@core-js/pure/actual/self";
var _ref;
// Computed-key destructuring assignments preserve receiver coercion before key effects.
// Sealed and live optional receivers keep their throwing and short-circuit boundaries.
let ca = 0;
let viaProbeAssignSeKey;
_ref = null == _globalThis.window ? void 0 : _self.Object, null == _ref ? _ref[""] : (ca++, viaProbeAssignSeKey = _Object$keys);
export { viaProbeAssignSeKey };
export { ca };