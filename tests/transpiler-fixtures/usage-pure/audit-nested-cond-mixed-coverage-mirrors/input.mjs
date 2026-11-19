// a MIXED nested mirror: the polyfillable leaf takes its import, the always-present
// sibling reads through the branch root passthrough - one unresolvable leaf must not
// kill the whole mirror
const userObj = { Array: {} };
let useGlobal = false;
const { Array: { of, isArray } } = useGlobal ? globalThis : userObj;
export { of, isArray };

// NEGATIVE: an ALL-unresolvable pattern has nothing to mirror for - the branch stays raw
const { Array: { isArray: alone } } = useGlobal ? globalThis : userObj;
export { alone };

// A symbol slot passes through beside the mirrored static; the foreign branch stays native.
const { Array: { from: mixedFrom, [Symbol.iterator]: mixedIt } } = useGlobal ? globalThis : userObj;
export { mixedFrom, mixedIt };
