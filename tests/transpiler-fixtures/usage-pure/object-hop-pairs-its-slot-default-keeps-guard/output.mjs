import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Map from "@core-js/pure/actual/map";
// Defined constructor and static ponyfills make these source defaults unreachable at every
// depth: under an object hop, under an array wrapper, and beside a sibling.
function defaultKeepsGuard() {
  const {
    w: {
      Map: dfMap = null
    },
    z
  } = {
    w: {
      Map: _Map
    },
    z: 1
  };
  const {
    Array: {
      from: dfFrom = null
    }
  } = {
    Array: {
      from: _Array$from
    }
  };
  const [{
    of: dfOf = null
  }, y] = [{
    of: _Array$of
  }, 2];
  const {
    w: {
      Array: {
        from: dfDeep = null
      }
    }
  } = {
    w: {
      Array: {
        from: _Array$from
      }
    }
  };
  return [dfMap, z, dfFrom, dfOf, y, dfDeep];
}
export default [defaultKeepsGuard()];