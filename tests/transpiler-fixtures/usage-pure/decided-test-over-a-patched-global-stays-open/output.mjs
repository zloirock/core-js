import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// a presence test over a global this file has already patched decides nothing, wherever the pass
// collecting the patches meets the names the test guards first: a constructor and a key written under
// it stay guarded
_globalThis.Promise = MyPromise;
let Ctor;
if (typeof Promise != 'undefined') Ctor = _Map;
Ctor.extra = 1;
let key;
if (typeof Promise != 'undefined') key = 'at';
const holder = {};
holder[key] = 1;
export const readCtor = () => (Ctor === _Map ? _Map$groupBy : Ctor.groupBy.bind(Ctor))([1], x => x);
export const readKey = list => list[key](0);