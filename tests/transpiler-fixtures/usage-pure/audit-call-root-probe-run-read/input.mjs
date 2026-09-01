// the positional fold base for a claimless CALL-rooted read is the identifier twin's, cell for
// cell: an ordinary leaf reads THROUGH the run and the whole navigation folds onto the root
// ponyfill - probe hops included, erasing the same intermediate-hop throw the identifier
// spelling erases - whatever mix of backed and probe hops stands between
const dh = () => globalThis;
export const probeOnlyRead = String(dh().window.customQ);
export const probeOnlyValue = typeof dh().window.Array;
export const backedThenProbeRead = String(dh().self.window.customQ);
export const probeThenBackedRead = String(dh().window.self.customQ);
// a sequence PREFIX around the folded run re-emits ahead of the base, where the source ran it
// - nested prefixes flatten in source order, a computed-key effect stays in the surviving key,
// and the `delete` fold takes the same slot; a probe LEAF keeps the run spelled and only the
// call swaps, its prefix staying in place
// ... the deleted slot gets a name of its own: a `delete` is a slot MUTATION, and sharing the
// read rows' key would move the whole file into the mutated family
let counter = 0;
export const prefixedRead = String((counter++, dh()).window.customQ);
export const nestedPrefixedRead = String((counter++, (counter++, dh())).window.customQ);
export const prefixedKeyEffect = String((counter++, dh()).window[(counter++, 'customQ')]);
export const prefixedDelete = delete (counter++, dh()).window.customQDel;
export const sealedPrefixedDelete = delete ((counter++, dh()).window).customQDel2;
export const prefixedProbeLeaf = typeof (counter++, dh()).self.window;
export { counter };
