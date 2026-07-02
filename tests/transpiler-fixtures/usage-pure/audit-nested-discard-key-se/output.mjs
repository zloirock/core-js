import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _self from "@core-js/pure/actual/self";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a nested destructure consuming its receiver must re-emit the side effect buried in the
// receiver's computed hop KEY: the discard probe folds the key, and a chain-assignment /
// root-call-only rescue dropped the key effect silently - on a full consume (receiver gone)
// and on a partial consume (receiver swapped under the surviving residual). polyfillable
// content inside the harvested key keeps its own rewrite; a chain-root call interleaves
// with the key effect in source-eval order
let c = 0;
const iterator = (c++, _Symbol$iterator);
export const r1 = [typeof iterator, c];
let d = 0;
const resolve = _Promise$resolve;
const {
  other
} = (d++, _self);
export const r2 = [typeof resolve, typeof other, d];
let a;
const groupBy = (a = _Array$of(3), _Map$groupBy);
export const r3 = [typeof groupBy, a.length];
let k = 0;
function mk() {
  k++;
  return _globalThis;
}
const entries = (mk(), k++, _Object$entries);
export const r4 = [typeof entries, k];