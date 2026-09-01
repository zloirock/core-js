import _globalThis from "@core-js/pure/actual/global-this";
// the positional fold base for a claimless CALL-rooted read is the identifier twin's, cell for
// cell: an ordinary leaf reads THROUGH the run and the whole navigation folds onto the root
// ponyfill - probe hops included, erasing the same intermediate-hop throw the identifier
// spelling erases - whatever mix of backed and probe hops stands between
const dh = () => _globalThis;
export const probeOnlyRead = String(_globalThis.customQ);
export const probeOnlyValue = typeof _globalThis.Array;
export const backedThenProbeRead = String(_globalThis.customQ);
export const probeThenBackedRead = String(_globalThis.customQ);
// a sequence PREFIX around the folded run re-emits ahead of the base, where the source ran it
// - nested prefixes flatten in source order, a computed-key effect stays in the surviving key,
// and the `delete` fold takes the same slot; a probe LEAF keeps the run spelled and only the
// call swaps, its prefix staying in place
// ... the deleted slot gets a name of its own: a `delete` is a slot MUTATION, and sharing the
// read rows' key would move the whole file into the mutated family
let counter = 0;
export const prefixedRead = String((counter++, _globalThis).customQ);
export const nestedPrefixedRead = String((counter++, counter++, _globalThis).customQ);
export const prefixedKeyEffect = String((counter++, _globalThis)[counter++, 'customQ']);
export const prefixedDelete = delete (counter++, _globalThis).customQDel;
export const sealedPrefixedDelete = delete (counter++, _globalThis).customQDel2;
export const prefixedProbeLeaf = typeof (counter++, _globalThis).self.window;
export { counter };