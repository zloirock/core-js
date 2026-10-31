import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// a disable directive on a sibling LEAF of a nested-proxy flatten: the directive-bearing
// leaf stays a native residual read off the proxy global; the enabled sibling still
// extracts its polyfill (the directive gates per leaf, not per statement)
const groupBy = _Map$groupBy;
const {
  // core-js-disable-next-line
  Object: {
    groupBy: og
  }
} = _globalThis;
console.log(groupBy, og);