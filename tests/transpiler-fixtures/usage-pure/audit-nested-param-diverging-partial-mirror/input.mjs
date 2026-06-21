// W19-H2: a DIVERGING conditional / `||` receiver mirror must NOT bail all-or-nothing when a sibling key
// is non-polyfillable. an all-or-nothing bail stranded the polyfillable key (`Array.from`), collapsing
// the receiver to a raw `_globalThis` whose native read threw / mis-valued on ie:11 on BOTH branches.
// each polyfillable leaf is mirrored to its pure import in the proxy branch; a non-polyfillable static
// (`Math.floor`) or inner method (`Array.isArray`) is PASSED THROUGH to the receiver's live value
// (`_globalThis.Math.floor`); the non-proxy USER branch stays native, its legitimate undefined preserved
let cond = 1;
const user = {};
function divergingProxy({ Array: { from }, Math: { floor } } = cond ? globalThis : user) {
  return [from, floor];
}
function divergingInner({ Array: { of, isArray } } = globalThis || user) {
  return [of, isArray];
}
export { divergingProxy, divergingInner };
