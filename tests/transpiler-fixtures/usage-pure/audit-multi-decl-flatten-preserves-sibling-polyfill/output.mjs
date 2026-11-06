import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// A nested static and an independent global read in the same declaration both receive polyfills.
const {
    Array: {
      from
    }
  } = {
    Array: {
      from: _Array$from
    }
  },
  y = _globalThis;
const {
    Map: {
      groupBy
    }
  } = {
    Map: {
      groupBy: _Map$groupBy
    }
  },
  sym = _Symbol$iterator;
export { from, y, groupBy, sym };