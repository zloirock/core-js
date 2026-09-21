import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a MIXED nested mirror: the polyfillable leaf takes its import, the always-present
// sibling reads through the branch root passthrough - one unresolvable leaf must not
// kill the whole mirror
const userObj = {
  Array: {}
};
let useGlobal = false;
const {
  Array: {
    of,
    isArray
  }
} = useGlobal ? {
  Array: {
    of: _Array$of,
    isArray: _globalThis.Array.isArray
  }
} : userObj;
export { of, isArray };

// NEGATIVE: an ALL-unresolvable pattern has nothing to mirror for - the branch stays raw
const {
  Array: {
    isArray: alone
  }
} = useGlobal ? _globalThis : userObj;
export { alone };

// A symbol slot passes through beside the mirrored static; the foreign branch stays native.
const {
  Array: {
    from: mixedFrom,
    [_Symbol$iterator]: mixedIt
  }
} = useGlobal ? {
  Array: {
    from: _Array$from,
    [_Symbol$iterator]: _getIteratorMethod(_globalThis.Array)
  }
} : userObj;
export { mixedFrom, mixedIt };