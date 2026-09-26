import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// A computed read before a nested static stays native when rest must exclude that read.
// Without rest, the ordinary shared receiver mirror still serves both claims.
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