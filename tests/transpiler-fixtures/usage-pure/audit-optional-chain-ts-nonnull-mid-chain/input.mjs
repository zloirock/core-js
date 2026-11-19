// TS non-null assertion `!` mid-chain between optional links: `arr?.b!.c.d.includes(2)`.
// the chain descent must re-peel transparent wrappers (TS / Paren / Chain) at EACH hop, not
// just the initial receiver; without per-hop peel, detection short-circuits at the `!`
// boundary, the null-check guard is dropped, and the call throws on null arr.
declare const arr: { b?: { c: { d: number[] } } };
arr?.b!.c.d.includes(2);
