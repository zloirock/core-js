import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// a DIVERGING conditional / `||` receiver mirror must NOT bail all-or-nothing when a sibling key
// is non-polyfillable; that bail strands the polyfillable `Array.from` and collapses the receiver
// to a raw `_globalThis` that threw on ie:11. each polyfillable leaf mirrors to its pure import,
// a non-polyfillable static/inner method passes through, the USER branch stays native
let cond = 1;
const user = {};
function divergingProxy({
  Array: {
    from
  },
  Math: {
    floor
  }
} = cond ? {
  Array: {
    from: _Array$from
  },
  Math: {
    floor: _globalThis.Math.floor
  }
} : user) {
  return [from, floor];
}
function divergingInner({
  Array: {
    of,
    isArray
  }
} = {
  Array: {
    of: _Array$of,
    isArray: _globalThis.Array.isArray
  }
}) {
  return [of, isArray];
}
export { divergingProxy, divergingInner };