import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _Map from "@core-js/pure/actual/map/constructor";
// A lexical loop-body declaration shadows its var head; its read cannot widen the head's constructor.
// A body var writes the head binding instead and shares its possible receiver families.
// Distinct methods keep each loop's injection observable.
for (var M of [_Map]) {
  let M = pick();
  use(M.groupBy);
}
for (var s of ['abc']) {
  let s = [1];
  use(_atMaybeArray(s).call(s, -1));
}
for (var t of ['abc']) {
  var t = [1];
  use(_includes(t).call(t, 1));
}