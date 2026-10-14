import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
// A `[Symbol.iterator]` key beside a claimed static off a realm constructor that has a ponyfill
// (`globalThis.Promise`): with no rest and no effect both extract, the static from its own entry and
// the iterator method from the constructor's ponyfill, read directly with no memo of the receiver.
const it = _getIteratorMethod(_Promise);
const allSettled = _Promise$allSettled;
it;
allSettled([]);
export { it, allSettled };