// a DIVERGING conditional / `||` receiver mirror must NOT bail all-or-nothing when a sibling key
// is non-polyfillable; that bail strands the polyfillable `Array.from` and collapses the receiver
// to a raw `_globalThis` that threw on ie:11. each polyfillable leaf mirrors to its pure import,
// a non-polyfillable static/inner method passes through, the USER branch stays native
let cond = 1;
const user = {};
function divergingProxy({ Array: { from }, Math: { floor } } = cond ? globalThis : user) {
  return [from, floor];
}
function divergingInner({ Array: { of, isArray } } = globalThis || user) {
  return [of, isArray];
}
export { divergingProxy, divergingInner };
