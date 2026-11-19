import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// defined foreign pair: the default is dead, the pair is unresolvable - no substitution; the static
// read is guarded against the default's candidate and reads the runtime value
let userObj = {};
const [p0, {
  Map: M
} = _globalThis] = [{}, userObj];
export const viaForeignPair = (M === _Map ? _Map$groupBy : M.groupBy.bind(M))([1, 2], v => v);