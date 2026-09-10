// A value-fan mutation receiver - a ternary / logical / inline chain-assign / computed-alias root -
// reaches a built-in through any branch. the cheap shape gate fans to the SAME leaves the scoped pass
// resolves, so the monkey-patch is detected and each static read routes through the injected ponyfill
// constructor instead of substituting a fresh import over the patch. distinct statics pin which
// receiver shape was detected; a computed const-aliased key (`registry[k]`) the gate cannot read keeps
// its bound container in play. a value fan can also sit MID-CHAIN as the chain root that navigates the
// global object to a constructor (`(c ? globalThis : self).Promise.any`) - both stages fan it too,
// and the WRITE lands where the reads do: a selection whose every live branch names one pristine
// proxy surface IS that surface, so it collapses onto the ponyfill exactly as the flat spelling does.
// an effect-bearing TEST folds too, and keeps its effect: the selection rides on as a harvested
// prefix ahead of the collapsed root (`(t++ ? _globalThis : _self, _Promise).any`), so the write
// lands where every read does and nothing of the test dies. the last row is that shape
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
let ticks = 0;
(ticks++ ? globalThis : self).WeakSet.prototype;
const r6 = new WeakSet();
export { r1, r2, r3, r4, r5, r6, w, ticks };
