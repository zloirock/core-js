import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
// A `||` / `??` the build decides reads as its LEFT wherever the selection is held - an alias of it, a
// realm alias, a receiver with a write in the left's own chain under `?.` - so pure claims the static off
// that left and the dead right offers nothing. Aliases of a full pure import retain its statics through
// decided selections, without a second import or identity guard. An undecided selection (`W`, always
// truthy) keeps the selection over it, dead right and all.
let held;
const M = _Map;
export const grouped = M.groupBy(list, key);
const I = _Iterator;
export const iterated = I.from(list);
const R = _globalThis;
export const viaRealm = _Array$of(1);
export const viaStoredNav = (held = _globalThis, _Reflect$ownKeys)(value);
const base = _Promise;
const P = base;
export const throughAlias = P.withResolvers();
const Q = base;
const C = Q;
export const throughChain = C.try(task);
const W = maybe || _Map;
export const {
  fromAsync
} = W || {
  fromAsync: _Array$fromAsync
};
export { held };