// In usage-global a presence test over a global the targets need and a filter drops (`Promise`, excluded
// here) decides nothing, nor does a `||` reading it off the realm: every operand - read through an alias,
// a receiver, a destructure or a `||` the alias holds - injects its own family. Its bare name decides, an
// engine lacking it throwing first, as a served global (`Map`) does; a dead arm injects nothing.
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
