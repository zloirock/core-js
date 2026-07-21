// a prototype-placement ctor claim over a CHAIN-ASSIGN root harvests the kept assignment
// exactly like a sequence prefix (`(k++, _Map).prototype`): the fallback used to bail on the
// assignment and strand the raw proxy hop (`.self` unponyfilled off-engine). distinct
// constructors per line
let n;
export const nonOptionalKept = (n = globalThis.window).self.Map.prototype.has.name;
let g;
export const resolvableKept = (g = globalThis)?.self.Set.prototype.add.name;
let k = 0;
export const seSequenceControl = (k++, globalThis.self).WeakMap.prototype.get.name;
// the OPTIONAL twin keeps its root guard; the ctor claim rides the receiver-independent
// body verbatim (`_Map.prototype.has`) - the kept assign lives once, in the guard memo
let o;
export const optionalKept = (o = globalThis.window)?.self.Map.prototype.has.name;
// a call tail with NO polyfillable meta above the fallback still keeps the root guard: the
// fold ate it before (`(c = gw, _Set).prototype.has.call(x)` returned a live value where
// native short-circuits to undefined on the absent window)
let c;
export const optionalKeptCall = (c = globalThis.window)?.self.Set.prototype.has.call(new Set([1]), 1);
// the ALIAS-valued root guards through its verbatim slice (no raw global inside the assign)
const w2 = globalThis.window;
let a;
export const optionalAliasCall = (a = w2)?.self.WeakMap.prototype.get.call(new WeakMap(), {});
// a bare non-polyfilled static read under the same root rides the guarded claim
let m;
export const optionalStaticMiss = (m = globalThis.window)?.self.Promise.noSuchStatic;
// a TS cast around the kept root: the fallback guard slices the bare assignment (both
// emitters), while a guard-ref rebuild keeps the wrapper INSIDE the memo
let tc;
export const optionalCastCall = ((tc = globalThis.window) as any)?.self.Map.prototype.get.call(new Map([[1, 2]]), 1);
export const plainControl = globalThis.self.WeakSet.prototype.delete.name;
