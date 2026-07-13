import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _includes from "@core-js/pure/actual/instance/includes";
import _Map from "@core-js/pure/actual/map/constructor";
import _Reflect from "@core-js/pure/actual/reflect/namespace";
import _self from "@core-js/pure/actual/self";
// A chain-assignment-rooted proxy navigation (`(a = globalThis).self.X`) roots at the assigned
// value, but the emit-side collapse walked chains chain-assign-BLIND: the assign stopped the root
// walk, the redundant `.self` hop survived, and the emitted receiver read an undefined hop off the
// pure root on hosts without it. the collapse must step through the assignment exactly like the
// canonical descent does: keep the assignment (its target observes the PURE root), harvest it as
// the sequence prefix, drop the hop. a pure-CTOR leaf whole-swaps with the same harvest; a bare
// assign root with no hop stays with the natural rewrite; an ALIAS buried in the assign keeps its
// identifier (root untouched, hop dropped); nested assigns peel to the terminal value; a write
// target whose every hop resolves stays with the natural per-hop rewrite (the leaf is the
// assignment slot, not a read). a pure NAMESPACE leaf under a wrapped root whole-swaps too.
let a, b, c, d, m, n, w;
const g = _globalThis;
export const viaAssign = (a = _globalThis, _globalThis).Math;
export const pureLeaf = (b = _globalThis, _Map);
export const noHop = (c = _globalThis).JSON;
export const aliasInAssign = (d = g, g).Atomics;
export const nestedAssign = (m = n = _globalThis, _globalThis).Number;
export const namespaceLeaf = (a = _globalThis, _Reflect);
(w = _globalThis, _self).Set = 42;
// consumed forms: an instance-method destructure keeps the collapsed receiver as the method's
// this-arg; a static-method call drops the receiver whole, keeping the assignment as the
// harvested prefix (the later root-collapse drive must defer to that wider claim)
export const flat = _flatMaybeArray((a = _globalThis, _globalThis).Array.prototype);
export const viaStatic = (b = _globalThis, _Array$of)(1, 2);
export const includes = _includes((c = g, g).Array.prototype);
// a paren-scoped optional whose subject is ENTIRELY proxy navigation over a chain-assign root is
// dead: the subject collapses to the always-defined pure root, so the `?.` deopts and the collapse
// owns the emit (a kept guard would memoize the raw `.self` hop - undefined off-engine, silently
// swallowing the polyfill)
let r;
export const optionalRebind = _findLastMaybeArray((r = _globalThis, _globalThis).Array.prototype);