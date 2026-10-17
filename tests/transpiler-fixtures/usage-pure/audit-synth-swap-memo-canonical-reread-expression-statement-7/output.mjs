import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// an SE-bearing chain-root call survives the whole-swap in the rescue plan; a provably-pure
// inline root call is dropped instead (value-identical, effect-free)
let n = 0;
function seCallRoot({
  groupBy: g3,
  gone
} = ((() => (n++, _globalThis))(), {
  groupBy: _Map$groupBy,
  gone: _Map.gone
})) {
  return [g3, gone];
}
seCallRoot();