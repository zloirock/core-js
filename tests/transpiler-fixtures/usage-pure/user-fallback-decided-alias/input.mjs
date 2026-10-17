// A `||` / `??` the build decides reads as its LEFT wherever the selection is held - an alias of it, a
// realm alias, a receiver with a write in the left's own chain under `?.` - so pure claims the static off
// that left and the dead right offers nothing. A left read through a local alias answers by its presence
// test and the bare name it holds alone, the price that keeps an alias chain linear: one holding a selection
// itself (`Q`) folds, but the static read through the next level guards the identity; one holding a selection
// the build leaves undecided (`W`, always truthy) keeps the selection over it, dead right and all.
let held;
const M = Map ?? Object;
export const grouped = M.groupBy(list, key);
const I = Iterator || Array;
export const iterated = I.from(list);
const R = globalThis ?? fallbackRealm;
export const viaRealm = R.Array.of(1);
export const viaStoredNav = ((held = globalThis).self || fallbackRealm)?.Reflect.ownKeys(value);
const base = Promise;
const P = base ?? AggregateError;
export const throughAlias = P.withResolvers();
const Q = base ?? Iterator;
const C = Q ?? AggregateError;
export const throughChain = C.try(task);
const W = maybe || Map;
export const { fromAsync } = W || Array;
export { held };
