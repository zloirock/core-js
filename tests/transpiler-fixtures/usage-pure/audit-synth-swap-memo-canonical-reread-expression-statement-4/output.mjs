import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// hop-key SE: the erased `self` hop's key effect is harvested the same way
let tick = 0;
function hopKeySe({
  groupBy: gb,
  more
} = (tick++, {
  groupBy: _Map$groupBy,
  more: _Map.more
})) {
  return [gb, more];
}
hopKeySe();