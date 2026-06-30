import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// over-record boundary for the destructure-leaf mutation pre-pass: a destructure alias off a LOCAL object
// (not a global proxy) resolves to NO global name via the read-side canon, so patching its member must NOT
// suppress substitution. the real `Map.groupBy` read below still receives the `_Map$groupBy` polyfill - this
// guards the bound-receiver delegation (resolveObjectName) against a false-bail / over-resolve to the global
const local = {
  Map: function () {}
};
const {
  Map: M
} = local;
M.groupBy = function () {};
export const a = _Map$groupBy([1], x => x);