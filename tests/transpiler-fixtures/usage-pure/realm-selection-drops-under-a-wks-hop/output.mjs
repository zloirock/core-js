import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
const iterateSelf = _getIteratorMethod(_Symbol);
// A realm selection serves its static beside a well-known-symbol hop.
// The symbol keeps its own receiver and the static receives its pure value.
const {
  self: {
    Map: {
      groupBy: viaSelf
    }
  }
} = {
  self: {
    Map: {
      groupBy: _Map$groupBy
    },
    Symbol: _Symbol
  }
};
const iterateRealm = _getIteratorMethod(_Symbol);
const {
  globalThis: {
    Map: {
      groupBy: viaRealm
    }
  }
} = {
  globalThis: {
    Map: {
      groupBy: _Map$groupBy
    },
    Symbol: _Symbol
  }
};
export { viaSelf, iterateSelf, viaRealm, iterateRealm };