// In usage-global a `||` / `??` the build decides injects for its LEFT alone wherever the selection is
// held - an alias, a receiver - so the static only the dead right carries (`Object.groupBy`,
// `Array.from`) stays out - through a chain of such aliases too (`Q`, `C`: no `AggregateError`). An alias
// holding a selection the build leaves undecided (`W`) leaves the one over it undecided as well, though
// `W` is always truthy: the right keeps its modules (`Array.fromAsync`).
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
