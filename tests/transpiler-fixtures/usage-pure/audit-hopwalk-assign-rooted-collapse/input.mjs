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
const g = globalThis;
export const viaAssign = (a = globalThis).self.Math;
export const pureLeaf = (b = globalThis).self.Map;
export const noHop = (c = globalThis).JSON;
export const aliasInAssign = (d = g).self.Atomics;
export const nestedAssign = (m = n = globalThis).self.Number;
export const namespaceLeaf = (a = globalThis).self.Reflect;
(w = globalThis).self.Set = 42;
// consumed forms: an instance-method destructure keeps the collapsed receiver as the method's
// this-arg; a static-method call drops the receiver whole, keeping the assignment as the
// harvested prefix (the later root-collapse drive must defer to that wider claim)
export const { flat } = (a = globalThis).self.Array.prototype;
export const viaStatic = (b = globalThis).self.Array.of(1, 2);
export const { includes } = (c = g).self.Array.prototype;
// a paren-scoped optional whose subject is ENTIRELY proxy navigation over a chain-assign root is
// dead: the subject collapses to the always-defined pure root, so the `?.` deopts and the collapse
// owns the emit (a kept guard would memoize the raw `.self` hop - undefined off-engine, silently
// swallowing the polyfill)
let r;
export const optionalRebind = ((r = globalThis).self)?.Array.prototype.findLast;
