import _at from "@core-js/pure/actual/instance/at";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
// a write a decided presence test guards is the binding's value for every read: a string key
// claims its instance method and a constructor alias its static directly, with no identity guard
let key;
if (typeof _Symbol != 'undefined') key = 'at';
export const first = list => _at(list).call(list, 0);
let P;
if (typeof _Promise != 'undefined') P = _Promise;
export const resolved = () => _Promise$resolve(1);