// a presence test over a global this file has already patched decides nothing, wherever the pass
// collecting the patches meets the names the test guards first: a constructor and a key written under
// it stay guarded
globalThis.Promise = MyPromise;
let Ctor;
if (typeof Promise != 'undefined') Ctor = Map;
Ctor.extra = 1;
let key;
if (typeof Promise != 'undefined') key = 'at';
const holder = {};
holder[key] = 1;
export const readCtor = () => Ctor.groupBy([1], x => x);
export const readKey = list => list[key](0);
