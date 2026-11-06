import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// a `var` bound by a for-of head is the element on every pass and after the loop, even where it
// hoists out of a nested block: a static read off it is guarded on that element in pure and injected
// in usage-global, the same on both parsers
for (var M of [_Map]) {}
(M === _Map ? _Map$groupBy : M.groupBy.bind(M))(src, fn);
function inner() {
  if (flag) {
    for (var P of [_Promise]) {}
  }
  return (P === _Promise ? _Promise$try : P.try.bind(P))(fn);
}