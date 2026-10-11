import _Promise$try from "@core-js/pure/actual/promise/try";
// an alias of a pure constructor index reads the statics that index already carries as written,
// exactly like the direct read off the import: no new import, no identity guard. an alias of the
// narrow constructor entry, which carries no statics, still gets its static supplied
import MapIndex from "@core-js/pure/actual/map";
import PromiseIndex from "@core-js/pure/actual/promise";
import PromiseNarrow from "@core-js/pure/actual/promise/constructor";
const M = MapIndex;
const P = PromiseIndex;
const Q = P;
const N = PromiseNarrow;
export const grouped = M.groupBy(items, pick);
export function defer() {
  return Q.withResolvers();
}
export const attempted = _Promise$try(run);
export const direct = PromiseIndex.allSettled(list);