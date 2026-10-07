import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set/constructor";
// A fully-consumed static destructure whose receiver buries an effect in a proxy-hop KEY inside a LOGICAL
// operand: where its left decides nothing (`.Map`, its constructor entry excluded, while `groupBy` keeps its
// own) the residual keeps the selection whole - the key effect exactly once, the hop collapsed onto the pure
// root (`(r++, _self).Map`), the right polyfilled.
let r = 0;
(r++, _self).Map || _Set;
const groupBy = _Map$groupBy;
groupBy(list, key);