import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Set from "@core-js/pure/actual/set/constructor";
c = _globalThis.Map || _Set;
// chain-assignment within destructure receiver: `c = (A || B)` evaluates to its right-hand side, which the
// fallback-receiver peel reaches through the store. A left the build does not serve (`globalThis.Map`, its
// constructor entry excluded, while `groupBy` keeps its own) keeps both operands, each polyfilled where the
// assignment stands, and the static is claimed off that left beside it
const groupBy = _Map$groupBy;
groupBy;