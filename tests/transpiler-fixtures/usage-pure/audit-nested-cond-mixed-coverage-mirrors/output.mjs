import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
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
} = useGlobal ? _globalThis : userObj;
export { of, isArray };

// NEGATIVE: an ALL-unresolvable pattern has nothing to mirror for - the branch stays raw
const {
  Array: {
    isArray: alone
  }
} = useGlobal ? _globalThis : userObj;
export { alone };

// A symbol slot passes through beside the mirrored static; the foreign branch stays native.
const _ref = userObj.Array,
  {
    from: mixedFrom
  } = _ref,
  mixedIt = _getIteratorMethod(_ref);
export { mixedFrom, mixedIt };