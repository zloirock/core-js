// a PLAIN proxy nav STORED into a variable is the proxy global it navigates, so the slot takes the
// plan's VALUE: spelled as the guarded render the store read `window` off the ponyfill and handed the
// user's variable `void 0` off-window, where the same nav read bare answers the ponyfill leaf. one nav
// answered three ways by position - bare read, stored, stored-under-a-claim - and the two emitters
// split on top of that. a nav that genuinely SHORT-CIRCUITS keeps the guard: there the store IS
// conditional. effect-free, identifier-rooted plans only - a sequence prefix, a key SE and an
// effectful root all re-emit INSIDE the guarded render, and the claims living in them go with it.
let k1, k2, k3, k4, k5;
let n = 0;
export const storedPlain = (k1 = globalThis.window.self);
export const storedUnderClaim = (k2 = globalThis.window.self)?.Object.getPrototypeOf({});
const galias = globalThis;
export const storedAliasRoot = (k3 = galias.window.self)?.Object.isExtensible({});
// a nav ENDING at the probe keeps its conditional store - its value really is absent off-window
export const storedProbeLeaf = (k4 = globalThis.window.self.window)?.Object.keys({});
// NEGATIVE: a live `?.` inside the stored nav - the store still happens, but its VALUE keeps the guard
export const storedShortCircuit = (k5 = globalThis.window?.self);
// an effect-bearing root rides AHEAD of the collapsed value, in source order - the same one slot the
// probe-hop family uses, not a guarded render (there is no short-circuit here to guard)
export const storedSeqRoot = ((n++, globalThis).window.self);
export { k1, k2, k3, k4, k5, n };

// the write BURIED in a longer navigation is the hop collapse's, not the stored canon's: the stored
// render spells the write and the proxy nav it stores, so claiming a value that continues PAST that
// nav froze its hops raw (`v = (w = globalThis).window.self.X` kept `.window.self` on the text leg
// where the AST leg - and every other consumer of the same source - collapses)
let bw, bv;
bv = (bw = globalThis).window.self.Array?.prototype;
export const buriedWriteInLongerNav = typeof bv;
export { bw, bv };
