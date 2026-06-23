import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise$any from "@core-js/pure/actual/promise/any";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _self from "@core-js/pure/actual/self";
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
(cond ? _Map : _Promise).groupBy = patchA;
const r1 = _Map.groupBy(items, fn);
(env || _Iterator).from = patchB;
const r2 = _Iterator.from(src);
const w = (h = _Promise).try = patchC;
const r3 = _Promise.try(fn);
const registry = {
  Promise: _Promise
};
const k = "Promise";
registry[k].allSettled = patchD;
const r4 = _Promise.allSettled(list);
(cond ? _globalThis : _self).Promise.any = patchE;
const r5 = _Promise.any(list);
export { r1, r2, r3, r4, r5, w };