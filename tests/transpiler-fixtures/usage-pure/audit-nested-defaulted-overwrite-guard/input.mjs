// a DEFAULTED instance leaf extracted as an assignment after its pattern: the dispatch answers the
// receiver's own member when the receiver is not the polyfilled surface, so it may be undefined, and
// the extraction guards it and falls back to the source's default, run exactly once. a realm surface
// nav and a user key hop are read once, by the dispatch; a capitalized hop off a user object is that
// object's own typed nav, read once where the source reads it.
declare const recvF: { codes: number[] };
declare const src: number[];
declare const holder: { flat?: () => number[] };
let m, q, s, n;
({ y: { flat: m = null } } = { y: holder });
[{ at: q = 7 }] = [src];
({ [(eff(), 'includes')]: s = 7 } = src);
let c;
({ Array: { prototype: { copyWithin: c = null } } } = globalThis.globalThis);
({ codes: { findIndex: n = null } } = recvF);
declare const userNs: { Array: { prototype: number[] } };
let fromUserNs;
({ Array: { prototype: { flatMap: fromUserNs } } } = userNs);
export { m, q, s, c, n, fromUserNs };
