// A plain navigation ending at a backed realm hop stores that backed value.
// A terminal environment probe remains observable through the store, while a
// source optional inside the navigation keeps its short-circuit. Prefix effects
// and buried writes survive the collapse in source order.
let k1, k2, k3, k4, k5;
let n = 0;
export const storedPlain = (k1 = globalThis.window.self);
export const storedUnderClaim = (k2 = globalThis.window.self)?.Object.getPrototypeOf({});
const galias = globalThis;
export const storedAliasRoot = (k3 = galias.window.self)?.Object.isExtensible({});
// A terminal probe keeps its observed value; the optional tests that stored value.
export const storedProbeLeaf = (k4 = globalThis.window.self.window)?.Object.keys({});
// NEGATIVE: a live `?.` inside the stored nav - the store still happens, but its VALUE keeps the guard
export const storedShortCircuit = (k5 = globalThis.window?.self);
// an effect-bearing root rides AHEAD of the collapsed value, in source order - the same one slot the
// probe-hop family uses, not a guarded render (there is no short-circuit here to guard)
export const storedSeqRoot = ((n++, globalThis).window.self);
export { k1, k2, k3, k4, k5, n };

// A write below the folded navigation still runs once. The stored root and the
// consumer above the navigation keep their own values.
let bw, bv;
bv = (bw = globalThis).window.self.Array?.prototype;
export const buriedWriteInLongerNav = typeof bv;
export { bw, bv };
