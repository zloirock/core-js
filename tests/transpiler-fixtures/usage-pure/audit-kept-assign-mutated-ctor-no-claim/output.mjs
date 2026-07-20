import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a MUTATED ctor under a kept-assign navigation never claims its ponyfill: the read goes
// through the mutated-static receiver swap (the nearest proxy hop's ponyfill), so the user's
// patch stays visible; the kept assignment and its value spelling survive as written
_globalThis.Set = class extends Set {};
let m;
export const mutatedHop = _nameMaybeFunction((m = _globalThis.window, _self).Set);
let a;
export const mutatedDirect = _nameMaybeFunction((a = _globalThis).Set);
let g;
export const mutatedResolvable = _nameMaybeFunction((g = _globalThis, _self).Set);
// the `?.`-LOWERED spelling of the same read (a transpiler ran first): the alias follow works
// on the desugared ternary too, and the mutated ctor still routes through the receiver swap
var _l;
export const mutatedLowered = (_l = _globalThis) == null ? void 0 : _nameMaybeFunction(_self.Set);