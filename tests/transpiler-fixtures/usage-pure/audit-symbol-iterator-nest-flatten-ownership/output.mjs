import _Array$from from "@core-js/pure/actual/array/from";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a `[Symbol.iterator]` prop sharing its declarator with a proxy-global nest belongs to the
// FLATTEN (its plan synthesizes the extraction) no matter which prop the visitor dispatches
// first: a per-prop route firing beside the whole-declarator rebuild would double-consume
// the prop and crash the transform composition, or capture the receiver without its
// polyfill rewrite. an effectful init keeps the harvested prefix running exactly once ahead
// of the extractions
const it = _getIteratorMethod(_globalThis);
const f = _Array$from;
const [{
  [_Symbol$iterator]: _unused,
  Array: _unused2,
  ...r
}] = [_globalThis];
it;
f(x);
r;
const it2 = _getIteratorMethod(_globalThis);
const fe = _Object$fromEntries;
const {
  [_Symbol$iterator]: _unused3,
  Object: _unused4,
  ...r2
} = _globalThis;
it2;
fe(y);
r2;
se();
const it3 = _getIteratorMethod(_globalThis);
const g = _Map$groupBy;
it3;
g(z);