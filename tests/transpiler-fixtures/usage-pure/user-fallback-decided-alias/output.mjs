import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
// A `||` / `??` the build decides reads as its LEFT wherever the selection is held - an alias of it, a
// realm alias, a receiver with a write in the left's own chain under `?.` - so pure claims the static off
// that left and the dead right offers nothing. A left read through a local alias answers by its presence
// test and the bare name it holds alone, the price that keeps an alias chain linear: one holding a selection
// itself (`Q`) folds, but the static read through the next level guards the identity; one holding a selection
// the build leaves undecided (`W`, always truthy) keeps the selection over it, dead right and all.
let held;
const M = _Map;
export const grouped = _Map$groupBy(list, key);
const I = _Iterator;
export const iterated = _Iterator$from(list);
const R = _globalThis;
export const viaRealm = _Array$of(1);
export const viaStoredNav = (held = _globalThis, _Reflect$ownKeys)(value);
const base = _Promise;
const P = base;
export const throughAlias = _Promise$withResolvers();
const Q = base;
const C = Q;
export const throughChain = (C === _Promise ? _Promise$try : C.try.bind(C))(task);
const W = maybe || _Map;
export const {
  fromAsync
} = W || {
  fromAsync: _Array$fromAsync
};
export { held };