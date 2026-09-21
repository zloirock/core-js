import _Array$from from "@core-js/pure/actual/array/from";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// A symbol-iterator claim and nested static share one receiver rewrite.
// Both values survive in either property order, with initializer effects running once.
const f = _Array$from;
const [{
  [_Symbol$iterator]: it,
  Array: _unused,
  ...r
}] = [_globalThis];
it;
f(x);
r;
const fe = _Object$fromEntries;
const {
  [_Symbol$iterator]: it2,
  Object: _unused2,
  ...r2
} = _globalThis;
it2;
fe(y);
r2;
const {
  [_Symbol$iterator]: it3,
  Map: {
    groupBy: g
  }
} = (se(), {
  [_Symbol$iterator]: _getIteratorMethod(_globalThis),
  Map: {
    groupBy: _Map$groupBy
  }
});
it3;
g(z);