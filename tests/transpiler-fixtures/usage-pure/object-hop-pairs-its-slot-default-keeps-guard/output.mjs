import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// Defined constructor and static ponyfills make these source defaults unreachable at every
// depth: under an object hop, under an array wrapper, and beside a sibling.
function defaultKeepsGuard() {
  const {
    w: {
      Map: dfMap = null
    },
    z
  } = {
    w: _globalThis,
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
  }, y] = [Array, 2];
  const {
    w: {
      Array: {
        from: dfDeep = null
      }
    }
  } = {
    w: _globalThis
  };
  return [dfMap, z, dfFrom, dfOf, y, dfDeep];
}
export default [defaultKeepsGuard()];