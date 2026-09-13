import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// Object-rest keeps the affected method slots native; computed symbol keys still polyfill.
// Independent reads and key/default expressions still receive their own polyfills.
// a `[Symbol.iterator]` prop sharing its declarator with a proxy-global nest belongs to the
// FLATTEN (its plan synthesizes the extraction) no matter which prop the visitor dispatches
// first: a per-prop route firing beside the whole-declarator rebuild would double-consume
// the prop and crash the transform composition, or capture the receiver without its
// polyfill rewrite. an effectful init keeps the harvested prefix running exactly once ahead
// of the extractions
const [{
  [_Symbol$iterator]: it,
  Array: {
    from: f
  },
  ...r
}] = [_globalThis];
it;
f(x);
r;
const {
  [_Symbol$iterator]: it2,
  Object: {
    fromEntries: fe
  },
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