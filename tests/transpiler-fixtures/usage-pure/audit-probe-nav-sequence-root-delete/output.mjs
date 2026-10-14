import _globalThis from "@core-js/pure/actual/global-this";
// a `delete` over a probe nav rooted at a SEQUENCE collapses the navigation whole onto the realm root,
// the sequence effect kept in place and a computed key's effect run once: no instance dispatch sits
// below the deleted member, so no guard scaffold keeps the probe's `?.`. off-window it deletes where
// the source throws on the plain `.self` hop - the accepted price of a sequence-rooted probe.
let n = 0;
export const seqDelete = delete (n++, _globalThis).Array?.prototype;
export const seqDeleteComputedKey = delete (n++, _globalThis).Array?.[n++, 'of'];
export { n };