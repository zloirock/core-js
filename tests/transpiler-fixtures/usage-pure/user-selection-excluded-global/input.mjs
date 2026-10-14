// pure counts a global the targets need and a filter drops (`Promise`, excluded here) present as usage-global does:
// the data subset carries it, so a presence test over it decides - read through an alias, a receiver, a destructure
// or a `||` the alias holds - and so does a `||` reading it off the realm, as its bare name and a served global
// (`Map`) do. The live arm stays raw, pure substituting nothing the user excludes; a static it serves takes its entry.
const P = typeof Promise !== 'undefined' ? Promise : MyPromise;
export const viaAlias = P.withResolvers();
export const viaReceiver = (typeof Promise !== 'undefined' ? Promise : MyPromise).try(task);
const C = typeof Promise !== 'undefined' ? Promise : Array;
export const viaKnownArm = C.from([1]);
export const { fromAsync } = typeof Promise !== 'undefined' ? Promise : Array;
const Q = Promise || Array;
export const viaFallback = Q.of(1);
const M = typeof Map !== 'undefined' ? Map : Object;
export const served = M.groupBy(list, key);
const R = globalThis.Promise || Object;
export const viaRealmFallback = R.fromEntries(pairs);
