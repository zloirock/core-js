import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Set from "@core-js/pure/actual/set/constructor";
// a write the next unconditional one overwrites before a closure is created is no value the closure reads:
// the identity guard over the values it may read leaves that write's constructor out, while a write after
// the closure stays one of them
let C = _Iterator;
C = Object;
C = _Map;
export const read = () => (C === _Map ? _Map$groupBy : C.groupBy.bind(C))([1], x => x);
C = _Set;