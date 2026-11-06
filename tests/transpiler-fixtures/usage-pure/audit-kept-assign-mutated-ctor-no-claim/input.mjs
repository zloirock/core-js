// a MUTATED ctor under a kept-assign navigation never claims its ponyfill: the read goes
// through the mutated-static receiver swap (the nearest proxy hop's ponyfill), so the user's
// patch stays visible; the kept assignment and its value spelling survive as written
globalThis.Set = class extends Set {};
let m;
export const mutatedHop = (m = globalThis.window).self.Set.name;
let a;
export const mutatedDirect = (a = globalThis).Set.name;
let g;
export const mutatedResolvable = (g = globalThis)?.self.Set.name;
// the `?.`-LOWERED spelling of the same read (a transpiler ran first): the alias follow works
// on the desugared ternary too - the guarded ref is optional-free, so the proxy hop drops
// onto it and the mutated ctor reads raw off the user's own binding
var _l;
export const mutatedLowered = (_l = globalThis) == null ? void 0 : _l.self.Set.name;
