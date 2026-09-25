import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
// a callee whose returns DISAGREE pairs the slot as the union of what each return spells: pure guards
// the read against every candidate at runtime and usage-global injects the static of each. the
// returns share their static, and the Map one owes its constructor entry beside it
function pick() {
  if (flag) return {
    a: Object
  };
  return {
    a: _Map
  };
}
const {
  a: viaReturns
} = pick();
export const fromReturns = (viaReturns === _Map ? _Map$groupBy : viaReturns === Object ? _Object$groupBy : viaReturns.groupBy.bind(viaReturns))([1], v => v);