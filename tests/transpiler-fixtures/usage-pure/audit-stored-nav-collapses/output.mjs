import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// A plain navigation ending at a backed realm hop stores that backed value.
// A terminal environment probe remains observable through the store, while a
// source optional inside the navigation keeps its short-circuit. Prefix effects
// and buried writes survive the collapse in source order.
let k1, k2, k3, k4, k5;
let n = 0;
export const storedPlain = k1 = _self;
export const storedUnderClaim = (k2 = _self)?.Object.getPrototypeOf({});
const galias = _globalThis;
export const storedAliasRoot = (k3 = _self)?.Object.isExtensible({});
// A terminal probe keeps its observed value; the optional tests that stored value.
export const storedProbeLeaf = (k4 = _self.window)?.Object.keys({});
// NEGATIVE: a live `?.` inside the stored nav - the store still happens, but its VALUE keeps the guard
export const storedShortCircuit = k5 = null == _globalThis.window ? void 0 : _self;
// an effect-bearing root rides AHEAD of the collapsed value, in source order - the same one slot the
// probe-hop family uses, not a guarded render (there is no short-circuit here to guard)
export const storedSeqRoot = (n++, _self);
export { k1, k2, k3, k4, k5, n };

// A write below the folded navigation still runs once. The stored root and the
// consumer above the navigation keep their own values.
let bw, bv;
bv = (bw = _globalThis, _self).Array?.prototype;
export const buriedWriteInLongerNav = typeof bv;
export { bw, bv };