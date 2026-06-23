// A value-fan mutation receiver - a ternary / logical / inline chain-assign / computed-alias root -
// reaches a built-in through any branch. the cheap shape gate fans to the SAME leaves the scoped pass
// resolves, so the monkey-patch is detected and each static read routes through the injected ponyfill
// constructor instead of substituting a fresh import over the patch. distinct statics pin which
// receiver shape was detected; a computed const-aliased key (`registry[k]`) the gate cannot read keeps
// its bound container in play. a value fan can also sit MID-CHAIN as the chain root that navigates the
// global object to a constructor (`(c ? globalThis : self).Promise.any`) - both stages fan it too.
let cond;
let env;
let h;
(cond ? Map : Promise).groupBy = patchA;
const r1 = Map.groupBy(items, fn);
(env || Iterator).from = patchB;
const r2 = Iterator.from(src);
const w = ((h = Promise).try = patchC);
const r3 = Promise.try(fn);
const registry = { Promise };
const k = "Promise";
registry[k].allSettled = patchD;
const r4 = Promise.allSettled(list);
(cond ? globalThis : self).Promise.any = patchE;
const r5 = Promise.any(list);
export { r1, r2, r3, r4, r5, w };
