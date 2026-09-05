import _Array$from from "@core-js/pure/actual/array/from";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Set from "@core-js/pure/actual/set/constructor";
// a multi-prop ctor-hop pattern whose init carries a SEQUENCE PREFIX still re-anchors its residual on
// the pure constructor: the prefix lifts to its own statement on every host, so what the residual
// reads is the quiet tail - the same init its prefix-less twin anchors on - and never the proxy root's
// native slot. a destructure host buried in that prefix flattens ahead of it
let eff = 0;
eff++;
const declFrom = _Array$from;
const {
  union: declUnion
} = _Set;
let from, union;
eff++;
from = _Array$from;
({
  union
} = _Set);
let inner;
inner = _Map$groupBy;
from = _Array$from;
({
  union
} = _Set);
export { eff, declFrom, declUnion, from, union, inner };