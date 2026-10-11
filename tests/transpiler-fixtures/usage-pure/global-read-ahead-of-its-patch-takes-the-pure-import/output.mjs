import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Promise from "@core-js/pure/actual/promise";
import _Set from "@core-js/pure/actual/set";
import _Symbol from "@core-js/pure/actual/symbol";
// a read of a global this file patches that runs before every write of its slot still sees what this
// build serves, so it takes the pure import: a value, a presence test deciding the key it guards, a
// detect guarding its own patch. a read after the patch, or deferred into a function, reads the user's
// slot
export const early = new _Set([0]);
let key;
if (typeof _Promise != 'undefined') key = 'at';
export const readKey = list => _at(list).call(list, 0);
export const detected = _Symbol;
_globalThis.Set = ShimSet;
_globalThis.Promise = ShimPromise;
export const late = new Set([1]);
export function deferred() {
  return new Set([2]);
}