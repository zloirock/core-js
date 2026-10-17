import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
// the OPTIONAL twin keeps its root guard; the ctor claim rides the receiver-independent
// body verbatim (`_Map.prototype.has`) - the kept assign lives once, in the guard memo
let o;
export const optionalKept = null == (o = _globalThis.window) ? void 0 : _nameMaybeFunction(_Map.prototype.has);