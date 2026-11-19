import _globalThis from "@core-js/pure/actual/global-this";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _self from "@core-js/pure/actual/self";
var _ref;
// Computed-key destructuring assignments preserve receiver coercion before key effects.
// Sealed and live optional receivers keep their throwing and short-circuit boundaries.
let ca = 0;
let viaSealedAssignSeKey;
_ref = (null == _globalThis.window ? void 0 : _self).Object, null == _ref ? _ref[""] : (ca++, viaSealedAssignSeKey = _Object$entries);
export { viaSealedAssignSeKey };
export { ca };