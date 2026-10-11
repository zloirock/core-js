// a `||` / `??` over an alias decides by the value the alias holds: a global core-js does not know may
// hold a falsy value (`opener` is null in most windows), so a write right of it runs and joins the values
// the name may hold - a key, a constructor and a nullish key written there. a built-in is never falsy,
// so a write right of it never runs
const unknown = someGlobal;
let key = 'from';
unknown || (key = 'of');
export const readKey = () => Array[key]([1]);
let Ctor = Iterator;
unknown || (Ctor = Object);
export const readCtor = () => Ctor.groupBy([1], x => x);
const named = someName;
let combinator = 'any';
named ?? (combinator = 'allSettled');
export const readNullish = () => Promise[combinator]([]);
const builtIn = WeakMap;
let entriesKey = 'entries';
builtIn || (entriesKey = 'values');
export const readBuiltIn = item => Object[entriesKey](item);
