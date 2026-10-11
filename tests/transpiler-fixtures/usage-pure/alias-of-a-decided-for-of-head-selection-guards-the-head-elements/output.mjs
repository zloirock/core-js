import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Set from "@core-js/pure/actual/set/constructor";
// an alias holding a `||` / `??` whose left is a for-of head over built-ins, the right dead, holds what the
// head holds: a static read off it, as a member or through a pattern, takes the identity guard over the
// head's elements as a read off an alias of the head spelled alone does
for (const M of [_Map, _Set]) {
  const held = M;
  use(held === _Map ? _Map$groupBy : held.groupBy);
}
for (const P of [_Promise, _Set]) {
  const held = P;
  const attempt = held === _Promise ? _Promise$try : held.try;
  use(attempt);
}