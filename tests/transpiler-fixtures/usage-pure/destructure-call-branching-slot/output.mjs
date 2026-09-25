import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
// a BRANCHING slot of the literal a call yields holds either arm: pure guards the read against each
// at runtime and usage-global injects the static of each. the arms share their static, and the Map
// arm owes its constructor entry beside it
const either = () => ({
  a: flag ? Object : _Map
});
const {
  a: viaBranching
} = either();
export const fromBranching = (viaBranching === Object ? _Object$groupBy : viaBranching === _Map ? _Map$groupBy : viaBranching.groupBy.bind(viaBranching))([1], v => v);