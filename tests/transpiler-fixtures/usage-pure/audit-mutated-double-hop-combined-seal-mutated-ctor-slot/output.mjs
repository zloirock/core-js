import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Set from "@core-js/pure/actual/set";
var _ref;
_globalThis.Set = class PatchedSet extends _Set {};
// a mutated CONSTRUCTOR slot cancels the claim the same way a mutated static does
let c;
export const mutatedCtorSlot = null == (c = _globalThis.window) ? void 0 : _at(_ref = _nameMaybeFunction(c.Set))?.call(_ref, 0);