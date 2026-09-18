// A leaf under an INNER DEFAULT reaches the mirror through the SHARED plan, and it has to be asked
// there even when the consume declines: the per-branch route sees only the leaf's own meta, and a
// PASSTHROUGH sibling then leaves the tree unrenderable, so the whole default stays native. The plan
// reads the slot the default pairs with and mirrors the arm, passthrough and all. The sibling-less
// twin is the control - that shape the per-branch route already served.
// Both kinds of sibling stand here, and the difference between them is the row's teeth. `Math.floor`
// is a key core-js polyfills nothing for, so its raw read is right whatever the mirror does - that
// row cannot tell a passthrough from a dropped polyfill. `Object.keys` is a key it DOES polyfill,
// and its two unextractable spellings - a member target, and an effect-bearing key - say which: the
// mirror owes the ponyfill inside the default, and a route that consumed the level instead, or that
// dispatched the leaf a second time off the host, prints a raw read or an instance call here.
// The counters are the other half: the default's own prefix and the key's effect each run exactly
// where the source runs them, once, and only where the host's slot is empty.
const unbacked = globalThis.shim;
const box = {};
let hits = 0;
let keyHits = 0;
let viaMemberSibling;
const { slot: { Array: { from: viaSibling }, Math: { floor: viaPassthrough } } = (hits++, unbacked || globalThis) } = {};
const { other: { Array: { from: viaAlone } } = (hits++, unbacked || globalThis) } = {};
({ held: { Array: { from: viaMemberSibling }, Object: { keys: box.keys } } = (hits++, unbacked || globalThis) } = {});
const { keyed: { Array: { from: viaKeyedSibling }, Object: { [(keyHits++, 'keys')]: viaKeyedLeaf } } = (hits++, unbacked || globalThis) } = {};
export { viaSibling, viaPassthrough, viaAlone, viaMemberSibling, viaKeyedSibling, viaKeyedLeaf, box, hits, keyHits };
