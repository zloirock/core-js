import _Array$of from "@core-js/pure/actual/array/of";
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

// NEGATIVE: a wks-key sibling still declines the nested mirror on both legs - the raw
// key-swap keeps parity (the wks admission is a joint follow-up)
const {
  Array: {
    from: mixedFrom,
    [_Symbol$iterator]: mixedIt
  }
} = useGlobal ? _globalThis : userObj;
export { mixedFrom, mixedIt };