import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// an identity self-assign (`M = M`) writes the alias's own value back and is a no-op for every
// flow-sensitive walk - for a PATTERN-bound alias exactly as for a plain declarator, so the static
// folds instead of falling to the runtime guard. the name the write is compared against is the
// binding's, which a pattern declarator does not spell in its id
let M = _Map;
M = M;
export const viaObject = _Map$groupBy(list, fn);
let [A] = [_globalThis.Array];
A = A;
export const viaArray = _Array$from([1]);