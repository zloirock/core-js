import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// a write through a selection of a container and an undefined value lands on the container - the other arm
// holds no slot - so a pattern over the selection reads the written constructor, whose static it keeps
const unset = flag ? {
  C: Object
} : undefined;
unset.C = _Map;
const {
  C
} = unset;
export const grouped = (C === _Map ? _Map$groupBy : C.groupBy.bind(C))([1], x => x);