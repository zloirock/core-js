// a disable directive on a sibling LEAF of a nested-proxy flatten: the directive-bearing
// leaf stays a native residual read off the proxy global; the enabled sibling still
// extracts its polyfill (the directive gates per leaf, not per statement)
const {
  Map: { groupBy },
  // core-js-disable-next-line
  Object: { groupBy: og },
} = globalThis;
console.log(groupBy, og);
