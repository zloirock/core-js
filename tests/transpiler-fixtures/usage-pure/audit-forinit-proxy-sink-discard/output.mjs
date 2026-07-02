import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a for-init destructure whose consumed receiver navigates proxy hops keeps its side effects
// in a loop-header sink; a MULTI-hop receiver cannot sink verbatim (the raw hop reads an
// undefined intermediate off-browser), so only the harvested effects sink - the chain-root
// call and a computed hop-key effect, in source-eval order. polyfillable content inside the
// harvested effects keeps its own rewrite; a single-hop receiver still sinks verbatim
let c = 0;
function sf() {
  c++;
  return _globalThis;
}
let out1;
for (const _ref = (sf(), c++), groupBy = _Map$groupBy; c < 3;) {
  out1 = typeof groupBy;
  c++;
}
export const r1 = [out1, c];
let d = 0;
let out2;
for (const _ref2 = d++, resolve = _Promise$resolve; d < 2;) {
  out2 = typeof resolve;
  d++;
}
export const r2 = [out2, d];
let a;
let out3;
for (const _ref3 = a = _Array$of(2), iterator = _Symbol$iterator; !out3;) {
  out3 = typeof iterator;
}
export const r3 = [out3, a.length];
let q;
let out4;
for (const _ref4 = (q = _Object$entries({
    k: 1
  }), Array), from = _Array$from; !out4;) {
  out4 = typeof from;
}
export const r4 = [out4, q.length];