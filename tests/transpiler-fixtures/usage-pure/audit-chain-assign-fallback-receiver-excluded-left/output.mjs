import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Set from "@core-js/pure/actual/set";
c = _globalThis.Map || _Set;
// chain-assignment within destructure receiver: `c = (A || B)` evaluates to its right-hand side, which the
// fallback-receiver peel reaches through the store. A left the build does not serve (`globalThis.Map`, its
// constructor entry excluded, while `groupBy` keeps its own) keeps both operands, each polyfilled where the
// assignment stands, and the static is claimed off that left beside it. `c`, declared nowhere, is the realm's slot:
// the constructor it stores leaves the file and takes its whole entry
const groupBy = _Map$groupBy;
groupBy;