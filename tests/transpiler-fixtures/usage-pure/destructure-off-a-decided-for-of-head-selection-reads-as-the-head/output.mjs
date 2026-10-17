import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Iterator from "@core-js/pure/actual/iterator";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
import _Set from "@core-js/pure/actual/set";
// a pattern reading a `||` / `??` whose left is a for-of head over built-ins, the right dead, reads as the
// head spelled alone: the key takes the identity guard over the head in a declaration and in an assignment,
// an effect prefix around the selection stays ahead of it, and a key claimed at the pattern's edge leaves
// the rest of the pattern reading the head
for (const M of [_Map, _Set]) {
  const groupBy = M === _Map ? _Map$groupBy : M.groupBy;
  use(groupBy);
}
let resolved;
for (const P of [_Promise, _Set]) {
  resolved = P === _Promise ? _Promise$withResolvers : P.withResolvers;
  use(resolved);
}
for (const I of [_Iterator, _Set]) {
  const from = (n(), I === _Iterator ? _Iterator$from : I.from);
  use(from);
}
for (const A of [Array, _Set]) {
  const fromAsync = A === Array ? _Array$fromAsync : A.fromAsync,
    {
      [key]: other
    } = A;
  use(fromAsync, other);
}