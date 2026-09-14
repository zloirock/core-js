// a DEFAULTED instance leaf whose claim is emitted as a post-statement OVERWRITE: the pure entry
// answers `it.method` VERBATIM off a receiver that is not the polyfilled surface, so the dispatch
// may be undefined and an unguarded overwrite bound that undefined over the value the destructure
// had already assigned. what stands in that case is whatever ran the default exactly ONCE: the raw
// SLOT while it survives (its binding holds the read or the source's own default), and the default
// NODE once the slot is pruned - nothing ran it then, and the guard is its only reader
declare const recvF: { codes: number[] };
declare const src: number[];
declare const holder: { flat?: () => number[] };
let m, q, s, n;
({ y: { flat: m = null } } = { y: holder });
[{ flat: q = 7 }] = [src];
({ [(eff(), 'flat')]: s = 7 } = src);
// a BUILT-IN surface nav is spelled by the overwrite, and the consumed slot leaves with it: the
// dispatch is then the only reader of `globalThis.Array.prototype`, so the default node is spelled
let c;
({ Array: { prototype: { flat: c = null } } } = globalThis.globalThis);
// a USER key hop the extraction OWNS is re-spelled where the source reads it: `recvF.codes` is read
// once, by the dispatch alone, once the consumed slot drops the host - the declaration host's answer
({ codes: { findIndex: n = null } } = recvF);
// ... but a CAPITALISED hop off a user object reaching a real INSTANCE surface takes the overwrite
// once its slot drops the nav: `userNs.Array.prototype` is then read exactly where the source reads
// it, once - the double read the re-read gate forbids needs a residual that survives beside it
declare const userNs: { Array: { prototype: number[] } };
let fromUserNs;
({ Array: { prototype: { flat: fromUserNs } } } = userNs);
export { m, q, s, c, n, fromUserNs };
